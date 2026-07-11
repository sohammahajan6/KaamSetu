export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RATED'

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface SavedAddress {
  area: string
  flat: string
  building: string
  street: string
  landmark: string
  lat?: number
  lng?: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  createdAt: string
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string // lucide icon name key
  basePrice: number
  active: boolean
  longDescription: string
  includes: string[]
  estimatedDuration: string
  whyUs: string[]
  tips: string
}

export interface ProviderProfile {
  id: string
  userId: string
  name: string
  categoryId: string
  bio: string
  yearsExperience: number
  hourlyRate: number
  lat: number
  lng: number
  areaLabel: string
  rating: number
  reviewCount: number
  available: boolean
  verificationStatus: VerificationStatus
  completedJobs: number
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  providerId: string
  providerName: string
  categoryId: string
  categoryName: string
  status: BookingStatus
  scheduledAt: string
  address: string
  notes: string
  price: number
  paymentReceived: boolean
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  bookingId: string
  providerId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProviderFilters {
  categoryId?: string
  sortBy?: 'distance' | 'rating'
  /** point to sort distance from */
  nearLat?: number
  nearLng?: number
  onlyAvailable?: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  role: 'CUSTOMER' | 'PROVIDER'
  categoryId?: string
  areaLabel?: string
  lat?: number
  lng?: number
}

export interface CreateBookingPayload {
  providerId: string
  scheduledAt: string
  address: string
  notes: string
}

export interface CreateAutoAssignBookingPayload {
  categoryId: string
  scheduledAt: string
  address: string
  notes: string
  lat?: number
  lng?: number
}

export interface CreateReviewPayload {
  bookingId: string
  rating: number
  comment: string
}

export interface UpdateProviderProfilePayload {
  bio?: string
  categoryId?: string
  hourlyRate?: number
  available?: boolean
}

export interface CategoryPayload {
  name: string
  description: string
  icon: string
  basePrice: number
  active: boolean
  longDescription: string
  includes: string[]
  estimatedDuration: string
  whyUs: string[]
  tips: string
}

export interface AuthResult {
  user: User
  /** present only for providers */
  providerProfile?: ProviderProfile
}

export interface PaymentOrder {
  razorpayOrderId: string
  amount: number
  keyId: string
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface PaymentResult {
  status: string
  bookingId: string
}

export interface AdminStats {
  totalUsers: number
  totalCustomers: number
  totalProviders: number
  totalAdmins: number
  pendingProviders: number
  verifiedProviders: number
  totalBookings: number
  activeBookings: number
  completedBookings: number
  cancelledBookings: number
  totalReviews: number
  totalRevenue: number
  providerCategories: number
  bookingStatusBreakdown: { status: string; count: number }[]
  recentBookings: {
    id: string
    categoryName: string
    customerName: string
    providerName: string
    status: string
    price: number
    createdAt: string
  }[]
  categoryRevenue: { name: string; bookings: number; revenue: number }[]
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
}

export interface AdminBookingRow {
  id: string
  customerId: string
  customerName: string
  providerId: string
  providerName: string
  categoryId: string
  categoryName: string
  status: string
  scheduledAt: string
  address: string
  notes: string
  price: number
  createdAt: string
  updatedAt: string
}

export interface ChangeRolePayload {
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
}
