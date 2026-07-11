import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderProfile, User } from '@/types'

interface AuthState {
  user: User | null
  providerProfile: ProviderProfile | null
  setSession: (user: User, providerProfile?: ProviderProfile) => void
  setProviderProfile: (profile: ProviderProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      providerProfile: null,
      setSession: (user, providerProfile) =>
        set({ user, providerProfile: providerProfile ?? null }),
      setProviderProfile: (providerProfile) => set({ providerProfile }),
      logout: () => set({ user: null, providerProfile: null }),
    }),
    { name: 'hyperlocal-session' },
  ),
)

export function homeForRole(role: string | undefined): string {
  switch (role) {
    case 'PROVIDER':
      return '/provider/dashboard'
    case 'ADMIN':
      return '/admin'
    case 'CUSTOMER':
      return '/browse'
    default:
      return '/login'
  }
}
