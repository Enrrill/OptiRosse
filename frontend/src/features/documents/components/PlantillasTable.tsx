import { DataTable } from '@/components/data/DataTable'
import type { AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { Plus, Pencil, EyeOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { choice, estadoActivo, TIPO_DOCUMENTO } from '@/lib/constants/choices'
import { FilterChip } from '@/components/ui/FilterChip'
import { formatDate } from '@/lib/format'
import type { PlantillaDocumento } from '@/types/models'

interface PlantillasTableProps {
  plantillas: PlantillaDocumento[]
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
  tipoFiltro: string
  onTipoChange: (value: string) => void
  canEdit: boolean
  onEdit: (plantilla: PlantillaDocumento) => void
  onToggleEstado: (plantilla: PlantillaDocumento) => void
  onNuevo: () => void
}

export function PlantillasTable({
  plantillas,
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
  tipoFiltro,
  onTipoChange,
  canEdit,
  onEdit,
  onToggleEstado,
  onNuevo,
}: PlantillasTableProps) {
  const hayFiltros = search !== '' || tipoFiltro !== '' || showInactivos

  const columns: ColumnDef<PlantillaDocumento>[] = [
    {
      accessorKey: 'tipo_documento',
      header: 'Tipo de documento',
      cell: ({row}) => (
        <StatusBadge display={choice(TIPO_DOCUMENTO, row.original.tipo_documento)} />
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({row}) => <span className="font-medium">{row.original.nombre}</span>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({row}) => <StatusBadge display={estadoActivo(row.original.activo)} />,
    },
    {
      accessorKey: 'actualizado_en',
      header: 'Última actualización',
      cell: ({row}) => <span className="text-on-surface-variant">{formatDate(row.original.actualizado_en)}</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({row}) =>
        canEdit ? (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar plantilla"
                    onClick={() => onEdit(row.original)}
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
                    aria-label={row.original.activo ? 'Desactivar plantilla' : 'Reactivar plantilla'}
                    onClick={() => onToggleEstado(row.original)}
                  >
                    {row.original.activo ? <EyeOff size={18} /> : <RotateCcw size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.original.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
  ]

  const activeCount = tipoFiltro !== '' && tipoFiltro !== 'todos' ? 1 : 0

  const activeFiltersList = [
    tipoFiltro && tipoFiltro !== 'todos'
      ? {
          id: 'tipo',
          label: 'Tipo',
          valueDisplay: choice(TIPO_DOCUMENTO, tipoFiltro)?.label ?? '',
          onRemove: () => onTipoChange('todos'),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onTipoChange('todos')
  }

  return (
    <DataTable<PlantillaDocumento>
      columns={columns}
      data={plantillas}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las plantillas') : null}
      onRetry={onRetry}
      emptyTitle={hayFiltros ? 'No hay plantillas con estos filtros' : 'No hay plantillas'}
      emptyDescription={
        canEdit
          ? 'Crea la primera plantilla para poder generar documentos.'
          : 'El administrador aún no ha creado plantillas de documentos.'
      }
      emptyAction={
        canEdit ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nueva plantilla
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nombre..."
          searchId="search-plantillas"
          quickFilters={
            <FilterChip
              id="toggle-inactivos-plantillas"
              checked={showInactivos}
              onCheckedChange={onToggleInactivos}
            />
          }
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Tipo de documento</label>
                <Select value={tipoFiltro} onValueChange={onTipoChange}>
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {Object.entries(TIPO_DOCUMENTO).map(([value, display]) => (
                      <SelectItem key={value} value={value}>
                        {display.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
