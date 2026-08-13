import { apiClient } from '@/lib/api/client'
import { CLIENTES, RECETAS, VARIANTES, detalle } from '@/lib/api/endpoints'
import { formatGradienteCompleto } from '@/lib/format'
import type { SearchableOption } from '@/components/forms/SearchableSelect'
import type { Cliente, RecetaOptica, VarianteProducto } from '@/types/models'

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

export async function buscarRecetas(
  query: string,
): Promise<SearchableOption<RecetaOptica>> {
  const res = await apiClient.get<RecetaOptica[]>(RECETAS, {
    params: { search: query || undefined, activo: true, page_size: PAGE_SIZE },
  })
  return (res.data.data ?? []).map((r) => ({
    value: String(r.id),
    label: r.nombre_paciente || `Receta #${r.id}`,
    description: formatGradienteCompleto(r.od_esfera, r.od_cilindro, r.od_eje),
    data: r,
  }))
}

export async function buscarVariantes(
  query: string,
): Promise<SearchableOption<VarianteProducto>> {
  const res = await apiClient.get<VarianteProducto[]>(VARIANTES, {
    params: { search: query || undefined, activo: true, page_size: PAGE_SIZE },
  })
  return (res.data.data ?? []).map((v) => ({
    value: String(v.id),
    label: v.sku,
    description: [
      [v.color, v.tamano].filter(Boolean).join(' · '),
      v.stock > 0 ? `${v.stock} uds` : 'Sin stock',
    ]
      .filter(Boolean)
      .join(' · '),
    data: v,
  }))
}

export function descripcionVariante(v: VarianteProducto): string {
  return [v.color, v.tamano].filter(Boolean).join(' · ')
}

export async function obtenerClientePorId(id: number | string): Promise<Cliente> {
  const res = await apiClient.get<Cliente>(detalle(CLIENTES, id))
  return res.data.data
}
