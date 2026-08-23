import { useApiQuery } from '@/hooks/useApi'
import { CATEGORIAS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Categoria } from '@/types/models'

export interface CategoriaParams extends PaginationParams {
  activo?: 'true' | 'false'
}

export function useCategorias(params: CategoriaParams = {}) {
  const clean: Record<string, unknown> = { ...params }
  if (!clean.search) delete clean.search
  if (!clean.activo) delete clean.activo

  const query = useApiQuery<Categoria[]>(['categorias', clean], CATEGORIAS, {
    params: clean,
  })

  return {
    categorias: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}