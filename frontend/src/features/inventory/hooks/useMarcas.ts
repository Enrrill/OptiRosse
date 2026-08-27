import { useApiQuery } from '@/hooks/useApi'
import { MARCAS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Marca } from '@/types/models'

export interface MarcaParams extends PaginationParams {
  activo?: boolean | 'false'
}

export function useMarcas(params: MarcaParams = {}) {
  const clean: Record<string, unknown> = { ...params }
  if (!clean.search) delete clean.search
  if (!clean.activo) delete clean.activo

  const query = useApiQuery<Marca[]>(['marcas', clean], MARCAS, {
    params: clean,
  })

  return {
    marcas: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
