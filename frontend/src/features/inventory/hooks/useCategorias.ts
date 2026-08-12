import { useApiQuery } from '@/hooks/useApi'
import { CATEGORIAS } from '@/lib/api/endpoints'
import type { Categoria } from '@/types/models'

interface CategoriaParams {
  search?: string
  activo?: 'true' | 'false'
}

export function useCategorias(params: CategoriaParams = {}) {
  const clean: Record<string, unknown> = { ...params, page_size: 100 }
  if (!clean.search) delete clean.search
  if (!clean.activo) delete clean.activo

  const query = useApiQuery<Categoria[]>(['categorias', clean], CATEGORIAS, {
    params: clean,
  })

  return {
    categorias: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}