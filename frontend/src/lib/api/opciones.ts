import { apiClient } from '@/lib/api/client'
import { CLIENTES, detalle } from '@/lib/api/endpoints'
import type { SearchableOption } from '@/components/forms/SearchableSelect'
import type { Cliente } from '@/types/models'

const PAGE_SIZE = 20

export async function buscarClientes(
  query: string,
): Promise<SearchableOption<Cliente>[]> {
  const res = await apiClient.get<Cliente[]>(CLIENTES, {
    params: { search: query || undefined, activo: true, page_size: PAGE_SIZE },
  })
  return (res.data.data ?? []).map((c) => ({
    value: String(c.id),
    label: c.nombre_comercial || c.razon_social,
    description: `RIF ${c.identificacion_fiscal}`,
    data: c,
  }))
}

export async function obtenerClientePorId(id: number | string): Promise<Cliente> {
  const res = await apiClient.get<Cliente>(detalle(CLIENTES, id))
  return res.data.data
}