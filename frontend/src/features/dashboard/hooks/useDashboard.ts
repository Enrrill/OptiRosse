import { useApiQuery } from '@/hooks/useApi'
import { DASHBOARD } from '@/lib/api/endpoints'
import type { DashboardResumen } from '@/types/models'

export function useDashboard() {
  const query = useApiQuery<DashboardResumen>(['dashboard', 'resumen'], DASHBOARD, {
    refetchOnWindowFocus: true,
  })

  return {
    resumen: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
