import { useApiQuery } from '@/hooks/useApi'
import { PAGOS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Pago } from '@/types/models'

export interface PagoParams extends PaginationParams {
  estado?: string
  cliente?: number
  pedido?: number
  metodo_pago?: number
  fecha_pago_after?: string
  fecha_pago_before?: string
}

export function usePagos(params: PagoParams) {
  const clean: Record<string, unknown> = { ...params }
  const limpiar = [
    'search',
    'estado',
    'cliente',
    'pedido',
    'metodo_pago',
    'fecha_pago_after',
    'fecha_pago_before',
  ]
  for (const key of limpiar) {
    if (clean[key] === undefined || clean[key] === null || clean[key] === '') delete clean[key]
  }

  const query = useApiQuery<Pago[]>(['pagos', clean], PAGOS, { params: clean })

  return {
    pagos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}