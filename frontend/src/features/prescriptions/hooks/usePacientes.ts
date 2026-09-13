import { apiClient } from '@/lib/api/client'
import { PACIENTES } from '@/lib/api/endpoints'
import type { SearchableOption } from '@/components/forms/SearchableSelect'
import type { PacienteResumen } from '@/types/models'
import type { ApiResponse } from '@/types/api'

const PAGE_SIZE = 20

export async function buscarPacientes(
  query: string,
): Promise<SearchableOption<PacienteResumen>[]> {
  const res = await apiClient.get<ApiResponse<PacienteResumen[]>>(PACIENTES, {
    params: { search: query || undefined, activo: true, page_size: PAGE_SIZE },
  })
  return (res.data.data ?? []).map((p) => ({
    value: String(p.id),
    label: p.nombre_completo,
    description: p.cedula ? `CI: ${p.cedula}` : p.telefono ?? undefined,
    data: p,
  }))
}
