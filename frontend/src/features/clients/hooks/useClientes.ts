import { useApiQuery } from '@/hooks/useApi'
import { CLIENTES } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Cliente } from '@/types/models'

export function useClientes(params: PaginationParams) {
  const query = useApiQuery<Cliente[]>(['clientes', params], CLIENTES, { params })

  return {
    clientes: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
