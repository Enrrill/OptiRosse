import { useApiQuery } from '@/hooks/useApi'
import { METODOS_PAGO } from '@/lib/api/endpoints'
import type { MetodoPago } from '@/types/models'

interface MetodoPagoParams {
  search?: string
  activo?: 'true' | 'false'
}

export function useMetodosPago(params: MetodoPagoParams = {}) {
  const clean: Record<string, unknown> = { ...params, page_size: 100 }
  if (!clean.search) delete clean.search
  if (!clean.activo) delete clean.activo

  const query = useApiQuery<MetodoPago[]>(['metodos-pago', clean], METODOS_PAGO, {
    params: clean,
  })

  return {
    metodos: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}