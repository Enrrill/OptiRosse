import { useApiQuery } from '@/hooks/useApi'
import { RECETAS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { RecetaOptica } from '@/types/models'

export function useRecetas(params: PaginationParams) {
  const query = useApiQuery<RecetaOptica[]>(['recetas', params], RECETAS, { params })

  return {
    recetas: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
