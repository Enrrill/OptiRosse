import { useApiQuery } from '@/hooks/useApi'
import { USUARIOS } from '@/lib/api/endpoints'
import type { Usuario } from '@/types/models'

export function useUsuariosOpciones() {
  const query = useApiQuery<Usuario[]>(
    ['usuarios', 'auditoria-opciones'],
    USUARIOS,
    { params: { activo: true, page_size: 100 } },
  )

  return {
    usuarios: query.data?.data ?? [],
    isLoading: query.isLoading,
  }
}