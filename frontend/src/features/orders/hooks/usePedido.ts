import { useApiQuery } from '@/hooks/useApi'
import { PEDIDOS, detalle } from '@/lib/api/endpoints'
import type { Pedido } from '@/types/models'

export function usePedido(id: number | null) {
  const url = id != null ? detalle(PEDIDOS, id) : null

  const query = useApiQuery<Pedido>(['pedido', id], url)

  return {
    pedido: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}