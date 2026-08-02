import { useApiMutation } from '@/hooks/useApi'
import { CLIENTES, detalle } from '@/lib/api/endpoints'
import type { Cliente } from '@/types/models'
import type { ClientePayload } from '../components/clienteSchema'

export function useCrearCliente() {
  return useApiMutation<Cliente, ClientePayload>({
    url: CLIENTES,
    method: 'post',
    invalidates: [['clientes'], ['dashboard', 'resumen']],
    successMessage: 'Cliente creado correctamente',
  })
}

export function useActualizarCliente(id: number | null) {
  return useApiMutation<Cliente, ClientePayload>({
    url: id ? detalle(CLIENTES, id) : '',
    method: 'patch',
    invalidates: [['clientes'], ['clientes', 'detalle'], ['dashboard', 'resumen']],
    successMessage: 'Cliente actualizado correctamente',
  })
}

export function useDesactivarCliente(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(CLIENTES, id) : '',
    method: 'delete',
    invalidates: [['clientes'], ['clientes', 'detalle'], ['dashboard', 'resumen']],
    successMessage: 'Cliente desactivado correctamente',
  })
}

export function useReactivarCliente(id: number | null) {
  return useApiMutation<Cliente, { activo: boolean }>({
    url: id ? detalle(CLIENTES, id) : '',
    method: 'patch',
    invalidates: [['clientes'], ['clientes', 'detalle'], ['dashboard', 'resumen']],
    successMessage: 'Cliente reactivado correctamente',
  })
}
