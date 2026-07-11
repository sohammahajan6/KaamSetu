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

/**
 * Contract every API client must satisfy. The mock client implements this
 * now; the real Spring Boot HTTP client will implement the same interface
 * later so no component code changes.
 */
export interface ApiClient {
  // auth
  login(payload: LoginPayload): Promise<AuthResult>
  register(payload: RegisterPayload): Promise<AuthResult>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>

  // categories
  getCategories(): Promise<ServiceCategory[]>
  createCategory(payload: CategoryPayload): Promise<ServiceCategory>
  updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<ServiceCategory>
  deleteCategory(id: string): Promise<void>

  // providers
  getProviders(filters?: ProviderFilters): Promise<ProviderProfile[]>
  getProviderById(id: string): Promise<ProviderProfile>
  getProviderByUserId(userId: string): Promise<ProviderProfile>
  updateProviderProfile(
    providerId: string,
    payload: UpdateProviderProfilePayload,
  ): Promise<ProviderProfile>

  // bookings
  createBooking(customerId: string, payload: CreateBookingPayload): Promise<Booking>
  createAutoAssignBooking(customerId: string, payload: CreateAutoAssignBookingPayload): Promise<Booking>
  getMyBookings(userId: string, role: 'CUSTOMER' | 'PROVIDER'): Promise<Booking[]>
  getBookingById(id: string): Promise<Booking>
  updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>

  // reviews
  getReviewsForProvider(providerId: string): Promise<Review[]>
  createReview(customerId: string, payload: CreateReviewPayload): Promise<Review>

  // admin
  getPendingProviders(): Promise<ProviderProfile[]>
  verifyProvider(providerId: string, approve: boolean): Promise<ProviderProfile>
  getAdminStats(): Promise<AdminStats>
  getAdminUsers(): Promise<AdminUserRow[]>
  getAdminBookings(): Promise<AdminBookingRow[]>
  exportAdminBookings(): Promise<Blob>
  getAllProviders(filters?: ProviderFilters): Promise<ProviderProfile[]>
  changeUserRole(userId: string, role: string): Promise<void>
  deleteUser(userId: string): Promise<void>

  // push
  subscribeToPush(payload: { endpoint: string; p256dh: string; auth: string }): Promise<void>

  // saved address
  getSavedAddress(): Promise<SavedAddress | null>
  saveAddress(address: SavedAddress): Promise<void>

  // payments
  createPaymentOrder(bookingId: string): Promise<PaymentOrder>
  verifyPayment(payload: VerifyPaymentPayload): Promise<PaymentResult>
}
