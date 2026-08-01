import { useNavigate } from 'react-router'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import { useAuthStore } from '@/store/useAuth'

export function useLogout() {
  const navigate = useNavigate()

  return async () => {
    const { refresh, logout } = useAuthStore.getState()
    try {
      if (refresh) {
        await apiClient.post(AUTH_ENDPOINTS.logout, { refresh })
      }
    } catch {
      // el logout local se ejecuta igual aunque el backend falle
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }
}
