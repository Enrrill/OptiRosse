import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types/models'
import { notifyLogout } from '@/lib/api/authSync'
import { queryClient } from '@/lib/constants/query'

interface AuthState {
  access: string | null
  refresh: string | null
  user: Usuario | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: Usuario | null) => void
  logout: () => void
  _clearAuth: () => void
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
      logout: () => {
        notifyLogout()
        queryClient.clear()
        set({ access: null, refresh: null, user: null, isAuthenticated: false })
      },
      _clearAuth: () =>
        set({ access: null, refresh: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'optirosse-auth',
    },
  ),
)
