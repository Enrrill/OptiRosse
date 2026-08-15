import { useQueryClient } from '@tanstack/react-query'
import { useApiMutation } from '@/hooks/useApi'
import { PAGOS, accion } from '@/lib/api/endpoints'
import type { Pago, PagoPayload } from '@/types/models'

const INVALIDATES_APPROVE: unknown[][] = [['pagos'], ['dashboard', 'resumen'], ['libro-mayor']]

export function useCrearPago() {
  return useApiMutation<Pago, PagoPayload>({
    url: PAGOS,
    method: 'post',
    invalidates: [['pagos'], ['dashboard', 'resumen']],
    successMessage: 'Pago registrado correctamente',
  })
}

export interface PagoTransicionVariables {
  motivo?: string
}

export function useAprobarPago(id: number | null) {
  const queryClient = useQueryClient()
  return useApiMutation<Pago, PagoTransicionVariables>(
    {
      url: id ? accion(PAGOS, id, 'aprobar') : '',
      method: 'post',
      invalidates: INVALIDATES_APPROVE,
      successMessage: 'Pago aprobado correctamente',
    },
    {
      onSuccess: (data) => {
        if (data.data?.cliente != null) {
          queryClient.invalidateQueries({ queryKey: ['libro-mayor', 'cliente', data.data.cliente] })
        }
      },
    },
  )
}

export function useRechazarPago(id: number | null) {
  return useApiMutation<Pago, PagoTransicionVariables>({
    url: id ? accion(PAGOS, id, 'rechazar') : '',
    method: 'post',
    invalidates: [['pagos'], ['dashboard', 'resumen']],
    successMessage: 'Pago rechazado correctamente',
  })
}