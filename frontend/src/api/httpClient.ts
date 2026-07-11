import type { ApiClient } from './client'
import { ApiError } from './mockClient'
import type {
  AuthResult,
  Booking,
  BookingStatus,
  CategoryPayload,
  CreateAutoAssignBookingPayload,
  CreateBookingPayload,
  CreateReviewPayload,
  LoginPayload,
  PaymentOrder,
  PaymentResult,
  ProviderFilters,
  ProviderProfile,
  RegisterPayload,
  Review,
  SavedAddress,
  ServiceCategory,
  UpdateProviderProfilePayload,
  VerifyPaymentPayload,
  AdminStats,
  AdminUserRow,
  AdminBookingRow,
} from '@/types'

// --------------------------------------------------------------- token store
const TOKEN_KEY = 'hyperlocal-jwt'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// --------------------------------------------------------------- fetch wrapper
const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  canFail = true,
): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  // Read the body ONCE — avoid "body stream already read"
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    parsed = { message: res.statusText }
  }
  if (!res.ok) {
    const msg = (parsed as { message?: string })?.message ?? 'Something went wrong.'
    throw new ApiError(msg)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return parsed as T
}

// --------------------------------------------------------------- HTTP client
export const httpClient: ApiClient = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const data = await request<{ token: string; user: import('@/types').User }>(
      'POST', '/api/auth/login', payload, false,
    )
    setToken(data.token)

    // If the user is a provider, fetch their profile to match AuthResult shape
    let providerProfile: ProviderProfile | undefined
    if (data.user.role === 'PROVIDER') {
      try {
        providerProfile = await httpClient.getProviderByUserId(data.user.id)
      } catch {
        // profile may not exist yet — that's fine
      }
    }
    return { user: data.user, providerProfile }
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const clean = {
      ...payload,
      phone: payload.phone.replace(/[\s-]/g, ''),
    }
    const data = await request<{ token: string; user: import('@/types').User }>(
      'POST', '/api/auth/register', clean, false,
    )
    setToken(data.token)

    let providerProfile: ProviderProfile | undefined
    if (data.user.role === 'PROVIDER') {
      try {
        providerProfile = await httpClient.getProviderByUserId(data.user.id)
      } catch {
        // expected during the brief window after registration
      }
    }
    return { user: data.user, providerProfile }
  },

  async forgotPassword(email: string): Promise<void> {
    await request<void>('POST', '/api/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await request<void>('POST', '/api/auth/reset-password', { token, password })
  },

  async getSavedAddress(): Promise<SavedAddress | null> {
    return request<SavedAddress | null>('GET', '/api/auth/address')
  },

  async saveAddress(address: SavedAddress): Promise<void> {
    await request<void>('PUT', '/api/auth/address', address)
  },

  async getCategories(): Promise<ServiceCategory[]> {
    return request<ServiceCategory[]>('GET', '/api/categories')
  },

  async createCategory(payload: CategoryPayload): Promise<ServiceCategory> {
    return request<ServiceCategory>('POST', '/api/admin/categories', payload)
  },

  async updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<ServiceCategory> {
    return request<ServiceCategory>('PATCH', `/api/admin/categories/${id}`, payload)
  },

  async deleteCategory(id: string): Promise<void> {
    return request<void>('DELETE', `/api/admin/categories/${id}`)
  },

  async getProviders(filters?: ProviderFilters): Promise<ProviderProfile[]> {
    const params = new URLSearchParams()
    if (filters?.categoryId) params.set('categoryId', filters.categoryId)
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    if (filters?.nearLat) params.set('nearLat', String(filters.nearLat))
    if (filters?.nearLng) params.set('nearLng', String(filters.nearLng))
    if (filters?.onlyAvailable) params.set('onlyAvailable', 'true')
    const qs = params.toString()
    return request<ProviderProfile[]>('GET', `/api/providers${qs ? '?' + qs : ''}`)
  },

  async getProviderById(id: string): Promise<ProviderProfile> {
    return request<ProviderProfile>('GET', `/api/providers/${id}`)
  },

  async getProviderByUserId(userId: string): Promise<ProviderProfile> {
    return request<ProviderProfile>('GET', `/api/providers/by-user/${userId}`)
  },

  async updateProviderProfile(
    providerId: string,
    payload: UpdateProviderProfilePayload,
  ): Promise<ProviderProfile> {
    return request<ProviderProfile>('PATCH', `/api/providers/${providerId}`, payload)
  },

  async createBooking(customerId: string, payload: CreateBookingPayload): Promise<Booking> {
    // the backend reads customerId from the JWT, not the body
    return request<Booking>('POST', '/api/bookings', payload)
  },

  async createAutoAssignBooking(customerId: string, payload: CreateAutoAssignBookingPayload): Promise<Booking> {
    return request<Booking>('POST', '/api/bookings/auto-assign', payload)
  },

  async getMyBookings(userId: string, role: 'CUSTOMER' | 'PROVIDER'): Promise<Booking[]> {
    return request<Booking[]>('GET', '/api/bookings/mine')
  },

  async getBookingById(id: string): Promise<Booking> {
    return request<Booking>('GET', `/api/bookings/${id}`)
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    return request<Booking>('PATCH', `/api/bookings/${id}/status`, { status })
  },

  async getReviewsForProvider(providerId: string): Promise<Review[]> {
    return request<Review[]>('GET', `/api/providers/${providerId}/reviews`)
  },

  async createReview(customerId: string, payload: CreateReviewPayload): Promise<Review> {
    return request<Review>('POST', '/api/reviews', payload)
  },

  async getPendingProviders(): Promise<ProviderProfile[]> {
    return request<ProviderProfile[]>('GET', '/api/admin/providers/pending')
  },

  async verifyProvider(providerId: string, approve: boolean): Promise<ProviderProfile> {
    return request<ProviderProfile>('PATCH', `/api/admin/providers/${providerId}/verify`, { approve })
  },

  async createPaymentOrder(bookingId: string): Promise<PaymentOrder> {
    return request<PaymentOrder>('POST', '/api/payments/create-order', { bookingId })
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<PaymentResult> {
    return request<PaymentResult>('POST', '/api/payments/verify', payload)
  },

  async subscribeToPush(payload: { endpoint: string; p256dh: string; auth: string }): Promise<void> {
    return request<void>('POST', '/api/push/subscribe', payload)
  },

  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('GET', '/api/admin/stats')
  },

  async getAdminUsers(): Promise<AdminUserRow[]> {
    return request<AdminUserRow[]>('GET', '/api/admin/users')
  },

  async getAdminBookings(): Promise<AdminBookingRow[]> {
    return request<AdminBookingRow[]>('GET', '/api/admin/bookings')
  },
  async exportAdminBookings(): Promise<Blob> {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE}/api/admin/bookings/export`, { headers })
    if (!res.ok) throw new ApiError('Failed to export bookings')
    return res.blob()
  },
  async getAllProviders(filters?: ProviderFilters): Promise<ProviderProfile[]> {
    const params = new URLSearchParams()
    if (filters?.categoryId) params.set('categoryId', filters.categoryId)
    const qs = params.toString()
    return request<ProviderProfile[]>('GET', `/api/admin/providers${qs ? '?' + qs : ''}`)
  },

  async changeUserRole(userId: string, role: string): Promise<void> {
    return request<void>('PATCH', `/api/admin/users/${userId}/role`, { role })
  },

  async deleteUser(userId: string): Promise<void> {
    return request<void>('DELETE', `/api/admin/users/${userId}`)
  },
}
