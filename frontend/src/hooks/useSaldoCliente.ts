import { useMemo } from 'react'
import { useApiQuery } from '@/hooks/useApi'
import { LIBRO_MAYOR } from '@/lib/api/endpoints'
import { useAuthStore } from '@/store/useAuth'
import type { LibroMayorAsiento } from '@/types/models'

const ROLES_SALDO = new Set(['administrador', 'contabilidad'])

export function useSaldoCliente(id: number | null) {
  const rol = useAuthStore((s) => s.user?.rol)
  const puedeVer = !!rol && ROLES_SALDO.has(rol)

  const params = useMemo(
    () => ({ cliente: id, ordering: '-id', page_size: 1 }),
    [id],
  )

  const query = useApiQuery<LibroMayorAsiento[]>(
    ['libro-mayor', 'cliente', id],
    puedeVer && id ? LIBRO_MAYOR : null,
    { params },
  )

  const saldo = Number(query.data?.data?.[0]?.saldo_posterior ?? 0)

  return {
    saldo,
    isLoading: query.isLoading,
    puedeVer,
  }
}