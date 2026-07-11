import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, homeForRole } from '@/store/auth'
import type { Role } from '@/types'

/** Redirects unauthenticated users to /login. */
export function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Redirects users whose role doesn't match to their own home. */
export function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeForRole(user.role)} replace />
  return <Outlet />
}

/** Sends already-authenticated users away from login/register. */
export function RedirectIfAuthed() {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return <Outlet />
}
