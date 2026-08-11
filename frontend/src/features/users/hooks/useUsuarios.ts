import { useApiQuery } from '@/hooks/useApi'
import { USUARIOS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Usuario } from '@/types/models'

export function useUsuarios(params: PaginationParams) {
  const query = useApiQuery<Usuario[]>(['usuarios', params], USUARIOS, { params })

  return {
    usuarios: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
