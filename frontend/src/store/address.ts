import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useAuthStore } from './auth'

export interface SavedAddress {
  area: string
  flat: string
  building: string
  street: string
  landmark: string
  lat?: number
  lng?: number
}

interface AddressState {
  saved: SavedAddress | null
  saveAddress: (address: SavedAddress) => void
  clearAddress: () => void
}

/**
 * Storage adapter that scopes saved addresses by the current user ID.
 * This ensures each user sees their own saved addresses even on the same browser.
 */
function userScopedStorage() {
  const fallbackKey = 'hyperlocal-address'
  return createJSONStorage<{ saved: SavedAddress | null }>(() => ({
    getItem: () => {
      const user = useAuthStore.getState().user
      const key = user ? `hyperlocal-address-${user.id}` : fallbackKey
      return localStorage.getItem(key)
    },
    setItem: (_, value) => {
      const user = useAuthStore.getState().user
      const key = user ? `hyperlocal-address-${user.id}` : fallbackKey
      localStorage.setItem(key, value)
    },
    removeItem: () => {
      const user = useAuthStore.getState().user
      const key = user ? `hyperlocal-address-${user.id}` : fallbackKey
      localStorage.removeItem(key)
    },
  }))
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      saved: null,
      saveAddress: (address) => set({ saved: address }),
      clearAddress: () => set({ saved: null }),
    }),
    {
      name: 'hyperlocal-address',
      storage: userScopedStorage(),
    },
  ),
)
