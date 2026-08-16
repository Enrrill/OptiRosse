import { useApiQuery } from '@/hooks/useApi'
import { AUDITORIA } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { RegistroAuditoria } from '@/types/models'

export interface RegistroAuditoriaParams extends PaginationParams {
  usuario?: number
  accion?: string
  tabla?: string
  objeto_id?: number
  fecha_creado_after?: string
  fecha_creado_before?: string
}

export function useRegistrosAuditoria(params: RegistroAuditoriaParams) {
  const clean: Record<string, unknown> = { ...params }
  const limpiar = [
    'search',
    'usuario',
    'accion',
    'tabla',
    'objeto_id',
    'fecha_creado_after',
    'fecha_creado_before',
  ]
  for (const key of limpiar) {
    if (clean[key] === undefined || clean[key] === null || clean[key] === '') delete clean[key]
  }

  const query = useApiQuery<RegistroAuditoria[]>(['auditoria', clean], AUDITORIA, {
    params: clean,
  })

  return {
    registros: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}