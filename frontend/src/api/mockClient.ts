import type { ApiClient } from './client'
import { seedBookings, seedCategories, seedProviders, seedReviews, seedUsers } from './seed'
import type {
  AuthResult,
  Booking,
  BookingStatus,
  Review,
  SavedAddress,
  ServiceCategory,
  ProviderProfile,
  User,
} from '@/types'

// ---- in-memory database ----------------------------------------------------
const db = {
  users: [...seedUsers],
  providers: [...seedProviders],
  categories: [...seedCategories],
  bookings: [...seedBookings],
  reviews: [...seedReviews],
}

let idCounter = 2000
const nextId = (prefix: string) => `${prefix}-${idCounter++}`
let lastMockPaymentBookingId: string | null = null

// ---- latency / failure simulation -------------------------------------------
const FAILURE_RATE = 0.04 // ~1 in 25 calls fails so error states get exercised

function simulate<T>(result: () => T, opts?: { canFail?: boolean }): Promise<T> {
  const delay = 150 + Math.random() * 250
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if ((opts?.canFail ?? true) && Math.random() < FAILURE_RATE) {
          reject(new ApiError('Network error: the request could not be completed. Please try again.'))
          return
        }
        resolve(result())
      } catch (err) {
        reject(err)
      }
    }, delay)
  })
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function authResultFor(user: User): AuthResult {
  const providerProfile =
    user.role === 'PROVIDER' ? db.providers.find((p) => p.userId === user.id) : undefined
  return clone({ user, providerProfile })
}

// ---- the mock client ---------------------------------------------------------
export const mockClient: ApiClient = {
  login({ email, password }) {
    return simulate(
      () => {
        const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (!user || password.length < 4) {
          throw new ApiError('Invalid email or password.')
        }
        return authResultFor(user)
      },
      { canFail: false },
    )
  },

  register(payload) {
    return simulate(
      () => {
        if (db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new ApiError('An account with this email already exists.')
        }
        const user: User = {
          id: nextId('user'),
          name: payload.name,
          email: payload.email,
          phone: payload.phone.replace(/[\s-]/g, ''),
          role: payload.role,
          createdAt: new Date().toISOString(),
        }
        db.users.push(user)
        if (payload.role === 'PROVIDER') {
          const profile: ProviderProfile = {
            id: nextId('prov'),
            userId: user.id,
            name: user.name,
            categoryId: payload.categoryId ?? db.categories[0].id,
            bio: '',
            yearsExperience: 0,
            hourlyRate: 300,
            lat: payload.lat ?? 18.5204,
            lng: payload.lng ?? 73.8567,
            areaLabel: payload.areaLabel ?? 'Pune',
            rating: 0,
            reviewCount: 0,
            available: false,
            verificationStatus: 'PENDING',
            completedJobs: 0,
          }
          db.providers.push(profile)
        }
        return authResultFor(user)
      },
      { canFail: false },
    )
  },

  getCategories() {
    return simulate(() => clone(db.categories))
  },

  createCategory(payload) {
    return simulate(() => {
      const cat: ServiceCategory = {
        id: nextId('cat'),
        slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
        ...payload,
      }
      db.categories.push(cat)
      return clone(cat)
    })
  },

  updateCategory(id, payload) {
    return simulate(() => {
      const cat = db.categories.find((c) => c.id === id)
      if (!cat) throw new ApiError('Category not found.')
      Object.assign(cat, payload)
      return clone(cat)
    })
  },

  deleteCategory(id) {
    return simulate(() => {
      const idx = db.categories.findIndex((c) => c.id === id)
      if (idx === -1) throw new ApiError('Category not found.')
      db.categories.splice(idx, 1)
    })
  },

  getProviders(filters) {
    return simulate(() => {
      let list = db.providers.filter((p) => p.verificationStatus === 'VERIFIED')
      if (filters?.categoryId) list = list.filter((p) => p.categoryId === filters.categoryId)
      if (filters?.onlyAvailable) list = list.filter((p) => p.available)

      const nearLat = filters?.nearLat ?? 18.5204 // Pune center
      const nearLng = filters?.nearLng ?? 73.8567

      const withDistance = list.map((p) => ({
        ...p,
        _distance: haversineKm(nearLat, nearLng, p.lat, p.lng),
      }))

      if (filters?.sortBy === 'rating') {
        withDistance.sort((a, b) => b.rating - a.rating)
      } else {
        withDistance.sort((a, b) => a._distance - b._distance)
      }

      return clone(withDistance.map(({ _distance, ...p }) => p))
    })
  },

  getProviderById(id) {
    return simulate(() => {
      const p = db.providers.find((x) => x.id === id)
      if (!p) throw new ApiError('Provider not found.')
      return clone(p)
    })
  },

  getProviderByUserId(userId) {
    return simulate(
      () => {
        const p = db.providers.find((x) => x.userId === userId)
        if (!p) throw new ApiError('Provider profile not found.')
        return clone(p)
      },
      { canFail: false },
    )
  },

  updateProviderProfile(providerId, payload) {
    return simulate(() => {
      const p = db.providers.find((x) => x.id === providerId)
      if (!p) throw new ApiError('Provider not found.')
      Object.assign(p, payload)
      return clone(p)
    })
  },

  createBooking(customerId, payload) {
    return simulate(() => {
      const customer = db.users.find((u) => u.id === customerId)
      const provider = db.providers.find((p) => p.id === payload.providerId)
      if (!customer || !provider) throw new ApiError('Invalid booking request.')
      
      const existing = db.bookings.find(
        (b) => b.customerId === customerId && b.providerId === provider.id && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)
      )
      if (existing) {
        throw new ApiError('You already have an active booking with this provider. Complete or cancel it first.')
      }

      const category = db.categories.find((c) => c.id === provider.categoryId)
      const booking: Booking = {
        id: nextId('bk'),
        customerId,
        customerName: customer.name,
        providerId: provider.id,
        providerName: provider.name,
        categoryId: provider.categoryId,
        categoryName: category?.name ?? 'Service',
        status: 'REQUESTED',
        scheduledAt: payload.scheduledAt,
        address: payload.address,
        notes: payload.notes,
        price: provider.hourlyRate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.bookings.unshift(booking)
      return clone(booking)
    })
  },

  createAutoAssignBooking(customerId, payload) {
    return simulate(() => {
      const customer = db.users.find((u) => u.id === customerId)
      if (!customer) throw new ApiError('Invalid booking request.')

      // Find available, verified providers for the category
      const candidates = db.providers.filter(
        (p) =>
          p.categoryId === payload.categoryId &&
          p.available &&
          p.verificationStatus === 'VERIFIED' &&
          p.userId !== customerId
      )
      if (candidates.length === 0) {
        throw new ApiError('No available technicians found for this service right now. Please try again later.')
      }

      // Score each candidate: rating (30%) + fewer active jobs (70%)
      const scored = candidates.map((p) => {
        const activeJobs = db.bookings.filter(
          (b) => b.providerId === p.id && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)
        ).length
        const ratingScore = p.rating / 5.0
        const jobLoadScore = 1.0 - Math.min(activeJobs, 5) / 5.0
        return { provider: p, score: ratingScore * 0.3 + jobLoadScore * 0.7 }
      })
      scored.sort((a, b) => b.score - a.score)
      const provider = scored[0].provider

      // Check duplicate
      const existing = db.bookings.find(
        (b) => b.customerId === customerId && b.providerId === provider.id && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)
      )
      if (existing) {
        throw new ApiError('You already have an active booking with the assigned provider. Complete or cancel it first.')
      }

      const category = db.categories.find((c) => c.id === provider.categoryId)
      const booking: Booking = {
        id: nextId('bk'),
        customerId,
        customerName: customer.name,
        providerId: provider.id,
        providerName: provider.name,
        categoryId: provider.categoryId,
        categoryName: category?.name ?? 'Service',
        status: 'REQUESTED',
        scheduledAt: payload.scheduledAt,
        address: payload.address,
        notes: payload.notes,
        price: provider.hourlyRate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.bookings.unshift(booking)
      return clone(booking)
    })
  },

  getMyBookings(userId, role) {
    return simulate(() => {
      if (role === 'PROVIDER') {
        const profile = db.providers.find((p) => p.userId === userId)
        return clone(db.bookings.filter((b) => b.providerId === profile?.id))
      }
      return clone(db.bookings.filter((b) => b.customerId === userId))
    })
  },

  getBookingById(id) {
    return simulate(() => {
      const b = db.bookings.find((x) => x.id === id)
      if (!b) throw new ApiError('Booking not found.')
      return clone(b)
    })
  },

  updateBookingStatus(id, status: BookingStatus) {
    return simulate(() => {
      const b = db.bookings.find((x) => x.id === id)
      if (!b) throw new ApiError('Booking not found.')
      if (status === 'COMPLETED' && !b.paymentReceived) {
        throw new ApiError('The customer must complete payment before the job can be marked as done.')
      }
      b.status = status
      b.updatedAt = new Date().toISOString()
      if (status === 'COMPLETED') {
        const p = db.providers.find((x) => x.id === b.providerId)
        if (p) p.completedJobs += 1
      }
      return clone(b)
    })
  },

  getReviewsForProvider(providerId) {
    return simulate(() =>
      clone(
        db.reviews
          .filter((r) => r.providerId === providerId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    )
  },

  createReview(customerId, payload) {
    return simulate(() => {
      const booking = db.bookings.find((b) => b.id === payload.bookingId)
      if (!booking) throw new ApiError('Booking not found.')
      const customer = db.users.find((u) => u.id === customerId)
      const review: Review = {
        id: nextId('rev'),
        bookingId: payload.bookingId,
        providerId: booking.providerId,
        customerId,
        customerName: customer?.name ?? 'Customer',
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString(),
      }
      db.reviews.unshift(review)
      booking.status = 'RATED'
      booking.updatedAt = new Date().toISOString()

      // recompute provider aggregate rating
      const p = db.providers.find((x) => x.id === booking.providerId)
      if (p) {
        const provReviews = db.reviews.filter((r) => r.providerId === p.id)
        p.reviewCount = provReviews.length
        p.rating =
          Math.round(
            (provReviews.reduce((sum, r) => sum + r.rating, 0) / provReviews.length) * 10,
          ) / 10
      }
      return clone(review)
    })
  },

  getPendingProviders() {
    return simulate(() => clone(db.providers.filter((p) => p.verificationStatus === 'PENDING')))
  },

  verifyProvider(providerId, approve) {
    return simulate(() => {
      const p = db.providers.find((x) => x.id === providerId)
      if (!p) throw new ApiError('Provider not found.')
      p.verificationStatus = approve ? 'VERIFIED' : 'REJECTED'
      if (approve) p.available = true
      return clone(p)
    })
  },

  subscribeToPush(payload) {
    return simulate(() => {})
  },

  createPaymentOrder(bookingId: string) {
    return simulate(() => {
      lastMockPaymentBookingId = bookingId
      return {
        razorpayOrderId: 'order_mock_' + nextId(''),
        amount: 50000,
        keyId: 'rzp_mock_key',
      }
    })
  },

  verifyPayment() {
    return simulate(() => {
      if (lastMockPaymentBookingId) {
        const b = db.bookings.find((x) => x.id === lastMockPaymentBookingId)
        if (b) b.paymentReceived = true
      }
      return { status: 'PAID', bookingId: lastMockPaymentBookingId ?? 'mock' }
    })
  },

  forgotPassword() {
    // Mock always succeeds — noop
    return simulate(() => {})
  },

  resetPassword() {
    // Mock always succeeds — noop
    return simulate(() => {})
  },

  getSavedAddress() {
    return simulate(() => null)
  },

  saveAddress() {
    return simulate(() => {})
  },

  changeUserRole(userId, role) {
    return simulate(() => {
      const u = db.users.find((x) => x.id === userId)
      if (!u) throw new ApiError('User not found.')
      u.role = role as any
      return clone(u)
    })
  },

  deleteUser(userId) {
    return simulate(() => {
      const idx = db.users.findIndex((x) => x.id === userId)
      if (idx === -1) throw new ApiError('User not found.')
      db.users.splice(idx, 1)
    })
  },

  getAdminStats() {
    return simulate(() => ({
      totalUsers: db.users.length,
      totalCustomers: db.users.filter(u => u.role === 'CUSTOMER').length,
      totalProviders: db.users.filter(u => u.role === 'PROVIDER').length,
      totalAdmins: db.users.filter(u => u.role === 'ADMIN').length,
      pendingProviders: db.providers.filter(p => p.verificationStatus === 'PENDING').length,
      verifiedProviders: db.providers.filter(p => p.verificationStatus === 'VERIFIED').length,
      totalBookings: db.bookings.length,
      activeBookings: db.bookings.filter(b => ['REQUESTED','ACCEPTED','IN_PROGRESS'].includes(b.status)).length,
      completedBookings: db.bookings.filter(b => ['COMPLETED','RATED'].includes(b.status)).length,
      cancelledBookings: db.bookings.filter(b => b.status === 'CANCELLED').length,
      totalReviews: db.reviews.length,
      totalRevenue: 45000,
      providerCategories: 5,
      bookingStatusBreakdown: [],
      recentBookings: [],
      categoryRevenue: [],
    }))
  },

  getAdminUsers() { return simulate(() => clone(db.users)) },
  getAdminBookings() { return simulate(() => clone(db.bookings)) },
  exportAdminBookings() { return simulate(() => new Blob(["ID,Status\n1,COMPLETED"], { type: "text/csv" })) },
  getAllProviders() { return simulate(() => clone(db.providers)) },
}
