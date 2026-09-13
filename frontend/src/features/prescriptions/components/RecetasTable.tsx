import { Pencil, UserX, RotateCcw, Plus } from 'lucide-react'
import { DataTable } from '@/components/data/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { estadoActivo } from '@/lib/constants/choices'
import { formatGradienteCompleto } from '@/lib/format'
import type { RecetaOptica } from '@/types/models'

interface RecetasTableProps {
  recetas: RecetaOptica[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
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
  onPageSizeChange,
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
  const columns: ColumnDef<RecetaOptica>[] = [
    {
      accessorKey: 'id',
      header: '# Receta',
      cell: ({row}) => <span className="font-mono text-sm font-medium text-on-surface">#{row.original.id}</span>,
    },
    {
      accessorKey: 'paciente',
      header: 'Paciente',
      cell: ({row}) => (
        <span className="font-medium text-on-surface">
          {row.original.paciente_detalle?.nombre_completo || 'Sin paciente'}
        </span>
      ),
    },
    {
      accessorKey: 'od',
      header: 'OD resumen',
      cell: ({row}) => (
        <span className="font-mono text-xs text-on-surface-variant">
          {formatGradienteCompleto(row.original.od_esfera, row.original.od_cilindro, row.original.od_eje)}
        </span>
      ),
    },
    {
      accessorKey: 'oi',
      header: 'OI resumen',
      cell: ({row}) => (
        <span className="font-mono text-xs text-on-surface-variant">
          {formatGradienteCompleto(row.original.oi_esfera, row.original.oi_cilindro, row.original.oi_eje)}
        </span>
      ),
    },
    { accessorKey: 'distancia_pupilar', header: 'DP', cell: ({row}) => formatDp(row.original.distancia_pupilar) },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({row}) => <StatusBadge display={estadoActivo(row.original.activo)} />,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({row}) => {
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
                      onEdit(row.original)
                    }}
                  >
                    <Pencil size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={row.original.activo ? 'Desactivar receta' : 'Reactivar receta'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleEstado(row.original)
                    }}
                  >
                    {row.original.activo ? <UserX size={18} /> : <RotateCcw size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.original.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
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
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las recetas') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay recetas inactivas' : 'No hay recetas'}
      emptyDescription="Registra la primera receta óptica para asociarla a tus pedidos."
      emptyAction={
        canEdit ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nueva receta
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por paciente..."
          searchId="search-recetas"
          quickFilters={
            <FilterChip
              id="toggle-inactivos-recetas"
              checked={showInactivos}
              onCheckedChange={onToggleInactivos}
            />
          }
        />
      }
      footer={
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          count={count}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    />
  )
}
