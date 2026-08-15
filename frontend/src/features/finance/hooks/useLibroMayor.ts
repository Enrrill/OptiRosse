import { useApiQuery } from '@/hooks/useApi'
import { LIBRO_MAYOR } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { LibroMayorAsiento } from '@/types/models'

export interface LibroMayorParams extends PaginationParams {
  cliente?: number
  tipo_asiento?: string
  fecha_creado_after?: string
  fecha_creado_before?: string
}

export function useLibroMayor(params: LibroMayorParams) {
  const clean: Record<string, unknown> = { ...params }
  const limpiar = [
    'search',
    'cliente',
    'tipo_asiento',
    'fecha_creado_after',
    'fecha_creado_before',
  ]
  for (const key of limpiar) {
    if (clean[key] === undefined || clean[key] === null || clean[key] === '') delete clean[key]
  }

  const query = useApiQuery<LibroMayorAsiento[]>(['libro-mayor', clean], LIBRO_MAYOR, {
    params: clean,
  })

  return {
    asientos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}