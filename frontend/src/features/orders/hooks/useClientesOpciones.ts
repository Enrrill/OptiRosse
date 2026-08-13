import { useApiQuery } from '@/hooks/useApi'
import { CLIENTES } from '@/lib/api/endpoints'
import type { Cliente } from '@/types/models'

export function useClientesOpciones() {
  const query = useApiQuery<Cliente[]>(
    ['clientes', 'opciones'],
    CLIENTES,
    { params: { activo: true, page_size: 500 } },
  )

  return {
    clientes: query.data?.data ?? [],
    isLoading: query.isLoading,
  }
}