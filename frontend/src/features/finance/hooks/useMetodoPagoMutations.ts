import { useApiMutation } from '@/hooks/useApi'
import { METODOS_PAGO, detalle } from '@/lib/api/endpoints'
import type { MetodoPago, MetodoPagoPayload } from '@/types/models'

const INVALIDATES: unknown[][] = [['metodos-pago'], ['pagos'], ['dashboard', 'resumen']]

export function useCrearMetodoPago() {
  return useApiMutation<MetodoPago, MetodoPagoPayload>({
    url: METODOS_PAGO,
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Método de pago creado correctamente',
  })
}

export function useActualizarMetodoPago(id: number | null) {
  return useApiMutation<MetodoPago, MetodoPagoPayload>({
    url: id ? detalle(METODOS_PAGO, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Método de pago actualizado correctamente',
  })
}

export function useDesactivarMetodoPago(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(METODOS_PAGO, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Método de pago desactivado correctamente',
  })
}

export function useReactivarMetodoPago(id: number | null) {
  return useApiMutation<MetodoPago, { activo: boolean }>({
    url: id ? detalle(METODOS_PAGO, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Método de pago reactivado correctamente',
  })
}