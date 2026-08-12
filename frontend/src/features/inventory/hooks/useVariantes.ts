import { useApiQuery } from '@/hooks/useApi'
import { VARIANTES } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { VarianteProducto } from '@/types/models'

export interface VarianteParams extends PaginationParams {
  stock_bajo?: boolean
  producto?: number
  activo?: boolean | 'false'
}

export function useVariantes(params: VarianteParams) {
  const clean: Record<string, unknown> = { ...params }
  for (const key of ['stock_bajo', 'producto', 'activo', 'search']) {
    if (!clean[key]) delete clean[key]
  }

  const query = useApiQuery<VarianteProducto[]>(['variantes', clean], VARIANTES, {
    params: clean,
  })

  return {
    variantes: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}