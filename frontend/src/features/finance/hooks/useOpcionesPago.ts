import { apiClient } from '@/lib/api/client'
import { METODOS_PAGO, PEDIDOS } from '@/lib/api/endpoints'
import { formatMoney } from '@/lib/format'
import type { SearchableOption } from '@/components/forms/SearchableSelect'
import type { MetodoPago, Pedido } from '@/types/models'
import type { ApiResponse } from '@/types/api'

const PAGE_SIZE = 20

export async function buscarPedidos(
  query: string,
  clienteId?: number,
): Promise<SearchableOption<Pedido>[]> {
  const res = await apiClient.get<ApiResponse<Pedido[]>>(PEDIDOS, {
    params: { search: query || undefined, cliente: clienteId, page_size: PAGE_SIZE },
  })
  return (res.data.data ?? []).map((p) => ({
    value: String(p.id),
    label: p.numero_pedido,
    description: `${p.cliente_detalle.nombre_comercial} · ${formatMoney(p.total)}`,
    data: p,
  }))
}

export async function buscarMetodosPago(
  query: string,
): Promise<SearchableOption<MetodoPago>[]> {
  const res = await apiClient.get<ApiResponse<MetodoPago[]>>(METODOS_PAGO, {
    params: { search: query || undefined, activo: true, page_size: 100 },
  })
  return (res.data.data ?? []).map((m) => ({
    value: String(m.id),
    label: `${m.nombre} (${m.moneda})`,
    description: m.requiere_referencia ? 'Requiere referencia' : undefined,
    data: m,
  }))
}