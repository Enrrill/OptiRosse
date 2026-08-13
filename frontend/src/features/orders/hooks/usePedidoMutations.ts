import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useApiMutation } from '@/hooks/useApi'
import { PEDIDOS, accion, detalle } from '@/lib/api/endpoints'
import type { EstadoPedido, Pedido, PedidoPayload } from '@/types/models'

const INVALIDAR_PEDIDOS = [['pedidos'], ['dashboard', 'resumen']]

function invalidarLibroMayor(queryClient: QueryClient, clienteId?: number | null) {
  if (clienteId != null) {
    queryClient.invalidateQueries({ queryKey: ['libro-mayor', 'cliente', clienteId] })
  }
}

export function useCrearPedido() {
  return useApiMutation<Pedido, PedidoPayload>({
    url: PEDIDOS,
    method: 'post',
    invalidates: INVALIDAR_PEDIDOS,
    successMessage: 'Pedido creado correctamente',
  })
}

export function useActualizarPedido(id: number | null) {
  return useApiMutation<Pedido, PedidoPayload>({
    url: id ? detalle(PEDIDOS, id) : '',
    method: 'put',
    invalidates: [['pedidos'], ['pedido', id], ['dashboard', 'resumen']],
    successMessage: 'Pedido actualizado correctamente',
  })
}

export function useEliminarPedido(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(PEDIDOS, id) : '',
    method: 'delete',
    invalidates: [['pedidos'], ['pedido', id], ['dashboard', 'resumen']],
    successMessage: 'Pedido eliminado correctamente',
  })
}

export function useConfirmarPedido(id: number | null) {
  const queryClient = useQueryClient()
  return useApiMutation<Pedido, { notas?: string }>(
    {
      url: id ? accion(PEDIDOS, id, 'confirmar/') : '',
      method: 'post',
      invalidates: [['pedidos'], ['pedido', id], ['dashboard', 'resumen']],
      successMessage: 'Pedido confirmado correctamente',
    },
    {
      onSuccess: (data) => invalidarLibroMayor(queryClient, data.data?.cliente),
    },
  )
}

export interface CambiarEstadoVariables {
  nuevo_estado: EstadoPedido
  motivo?: string
}

export function useCambiarEstadoPedido(id: number | null) {
  const queryClient = useQueryClient()
  return useApiMutation<Pedido, CambiarEstadoVariables>(
    {
      url: id ? accion(PEDIDOS, id, 'cambiar-estado/') : '',
      method: 'post',
      invalidates: [['pedidos'], ['pedido', id], ['dashboard', 'resumen']],
      successMessage: 'Estado del pedido actualizado',
    },
    {
      onSuccess: (data) => invalidarLibroMayor(queryClient, data.data?.cliente),
    },
  )
}