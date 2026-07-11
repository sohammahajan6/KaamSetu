import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { RequireRole, RedirectIfAuthed } from './guards'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { BrowsePage } from '@/features/booking/BrowsePage'
import { ServiceDetailPage } from '@/features/booking/ServiceDetailPage'
import { CategoryProvidersPage } from '@/features/booking/CategoryProvidersPage'
import { ProviderProfilePage } from '@/features/booking/ProviderProfilePage'
import { BookingFormPage } from '@/features/booking/BookingFormPage'
import { AutoAssignBookingPage } from '@/features/booking/AutoAssignBookingPage'
import { MyBookingsPage } from '@/features/booking/MyBookingsPage'
import { BookingDetailPage } from '@/features/booking/BookingDetailPage'
import { ProviderDashboardPage } from '@/features/provider/ProviderDashboardPage'
import { ProviderEditProfilePage } from '@/features/provider/ProviderEditProfilePage'
import { ProviderBookingDetailPage } from '@/features/provider/ProviderBookingDetailPage'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminProvidersPage } from '@/features/admin/AdminProvidersPage'
import { AdminCategoriesPage } from '@/features/admin/AdminCategoriesPage'
import { LandingPage } from '@/features/landing/LandingPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <AppShell />,
    children: [
      {
        element: <RequireRole role="CUSTOMER" />,
        children: [
          { path: '/browse', element: <BrowsePage /> },
          { path: '/services/:categoryId', element: <ServiceDetailPage /> },
          { path: '/services/:categoryId/providers', element: <CategoryProvidersPage /> },
          { path: '/providers/:id', element: <ProviderProfilePage /> },
          { path: '/book/auto/:categoryId', element: <AutoAssignBookingPage /> },
          { path: '/book/:providerId', element: <BookingFormPage /> },
          { path: '/bookings', element: <MyBookingsPage /> },
          { path: '/bookings/:id', element: <BookingDetailPage /> },
        ],
      },
      {
        element: <RequireRole role="PROVIDER" />,
        children: [
          { path: '/provider/dashboard', element: <ProviderDashboardPage /> },
          { path: '/provider/profile', element: <ProviderEditProfilePage /> },
          { path: '/provider/bookings/:id', element: <ProviderBookingDetailPage /> },
        ],
      },
      {
        element: <RequireRole role="ADMIN" />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/providers', element: <AdminProvidersPage /> },
          { path: '/admin/categories', element: <AdminCategoriesPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
