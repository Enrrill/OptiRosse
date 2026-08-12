import { useApiQuery } from '@/hooks/useApi'
import { PRODUCTOS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Producto } from '@/types/models'

export interface ProductoParams extends PaginationParams {
  tipo?: string
  categoria?: number
  marca?: string
  activo?: boolean | 'false'
}

export function useProductos(params: ProductoParams) {
  const clean: Record<string, unknown> = { ...params }
  for (const key of ['tipo', 'categoria', 'marca', 'activo', 'search']) {
    if (!clean[key]) delete clean[key]
  }

  const query = useApiQuery<Producto[]>(['productos', clean], PRODUCTOS, {
    params: clean,
  })

  return {
    productos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}