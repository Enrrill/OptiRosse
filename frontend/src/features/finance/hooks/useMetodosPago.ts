import { useApiQuery } from '@/hooks/useApi'
import { METODOS_PAGO } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { MetodoPago } from '@/types/models'

export function useMetodosPago(params: PaginationParams = {}) {
  const clean: Record<string, unknown> = {}
  if (params.page) clean.page = params.page
  if (params.page_size) clean.page_size = params.page_size
  if (params.search) clean.search = params.search
  if (params.activo !== undefined) clean.activo = params.activo

  const query = useApiQuery<MetodoPago[]>(['metodos-pago', clean], METODOS_PAGO, {
    params: clean,
  })

  return {
    metodos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}