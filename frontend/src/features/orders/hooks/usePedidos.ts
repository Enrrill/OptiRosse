import { useApiQuery } from '@/hooks/useApi'
import { PEDIDOS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { Pedido } from '@/types/models'

export interface PedidoParams extends PaginationParams {
  estado?: string
  cliente?: number
  numero_pedido?: string
  fecha_creado_after?: string
  fecha_creado_before?: string
}

export function usePedidos(params: PedidoParams) {
  const clean: Record<string, unknown> = { ...params }
  for (const key of ['search', 'estado', 'cliente', 'numero_pedido', 'fecha_creado_after', 'fecha_creado_before']) {
    if (!clean[key]) delete clean[key]
  }

  const query = useApiQuery<Pedido[]>(['pedidos', clean], PEDIDOS, { params: clean })

  return {
    pedidos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}