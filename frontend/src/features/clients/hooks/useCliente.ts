import { useApiQuery } from '@/hooks/useApi'
import { CLIENTES, detalle } from '@/lib/api/endpoints'
import type { Cliente } from '@/types/models'

export function useCliente(id: number | null) {
  const query = useApiQuery<Cliente>(
    ['clientes', 'detalle', id],
    id ? detalle(CLIENTES, id) : null,
  )

  return {
    cliente: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
