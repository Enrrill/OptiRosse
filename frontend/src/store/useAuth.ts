import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types/models'

interface AuthState {
  access: string | null
  refresh: string | null
  user: Usuario | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: Usuario | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      isAuthenticated: false,
      setTokens: (access, refresh) =>
        set({ access, refresh, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ access: null, refresh: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'optirosse-auth',
    },
  ),
)
