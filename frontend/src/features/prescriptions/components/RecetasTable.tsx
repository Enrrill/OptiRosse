import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { estadoActivo } from '@/lib/constants/choices'
import { formatGradienteCompleto } from '@/lib/format'
import type { RecetaOptica } from '@/types/models'

interface RecetasTableProps {
  recetas: RecetaOptica[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  search: string
  onSearchChange: (value: string) => void
  showInactivos: boolean
  onToggleInactivos: (value: boolean) => void
  canEdit: boolean
  onEdit: (receta: RecetaOptica) => void
  onToggleEstado: (receta: RecetaOptica) => void
  onNuevo: () => void
}

function formatDp(valor?: string | null): string {
  if (!valor) return '—'
  const num = Number(valor)
  if (Number.isNaN(num)) return '—'
  return `${num} mm`
}

export function RecetasTable({
  recetas,
  count,
  page,
  pageSize,
  onPageChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  showInactivos,
  onToggleInactivos,
  canEdit,
  onEdit,
  onToggleEstado,
  onNuevo,
}: RecetasTableProps) {
  const columns: Column<RecetaOptica>[] = [
    {
      key: 'id',
      header: '# Receta',
      cell: (row) => <span className="font-mono text-sm font-medium text-on-surface">#{row.id}</span>,
    },
    {
      key: 'nombre_paciente',
      header: 'Paciente',
      cell: (row) => (
        <span className="font-medium text-on-surface">{row.nombre_paciente || 'Sin paciente'}</span>
      ),
    },
    {
      key: 'od',
      header: 'OD resumen',
      cell: (row) => (
        <span className="font-mono text-xs text-on-surface-variant">
          {formatGradienteCompleto(row.od_esfera, row.od_cilindro, row.od_eje)}
        </span>
      ),
    },
    {
      key: 'oi',
      header: 'OI resumen',
      cell: (row) => (
        <span className="font-mono text-xs text-on-surface-variant">
          {formatGradienteCompleto(row.oi_esfera, row.oi_cilindro, row.oi_eje)}
        </span>
      ),
    },
    { key: 'distancia_pupilar', header: 'DP', cell: (row) => formatDp(row.distancia_pupilar) },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) => {
        if (!canEdit) return null
        return (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar receta"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(row)
                    }}
                  >
                    <Icon name="edit" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={row.activo ? 'Desactivar receta' : 'Reactivar receta'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleEstado(row)
                    }}
                  >
                    <Icon name={row.activo ? 'person_off' : 'restart_alt'} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable<RecetaOptica>
      columns={columns}
      data={recetas}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las recetas') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay recetas inactivas' : 'No hay recetas'}
      emptyDescription="Registra la primera receta óptica para asociarla a tus pedidos."
      emptyAction={
        canEdit ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nueva receta
          </Button>
        ) : undefined
      }
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              id="search-recetas"
              name="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por paciente..."
              className="pl-9"
            />
          </div>
          <label htmlFor="toggle-inactivos-recetas" className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
            <Switch id="toggle-inactivos-recetas" name="show_inactivos" checked={showInactivos} onCheckedChange={onToggleInactivos} />
            Mostrar inactivos
          </label>
        </div>
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}
