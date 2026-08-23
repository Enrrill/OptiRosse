import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Pagination } from '@/components/data/Pagination'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
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

  const columns: Column<PlantillaDocumento>[] = [
    {
      key: 'tipo_documento',
      header: 'Tipo de documento',
      cell: (row) => (
        <StatusBadge display={choice(TIPO_DOCUMENTO, row.tipo_documento)} />
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.nombre}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    {
      key: 'actualizado_en',
      header: 'Última actualización',
      cell: (row) => <span className="text-on-surface-variant">{formatDate(row.actualizado_en)}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) =>
        canEdit ? (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar plantilla"
                    onClick={() => onEdit(row)}
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
                    aria-label={row.activo ? 'Desactivar plantilla' : 'Reactivar plantilla'}
                    onClick={() => onToggleEstado(row)}
                  >
                    <Icon name={row.activo ? 'visibility_off' : 'restart_alt'} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
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
          valueDisplay: choice(TIPO_DOCUMENTO, tipoFiltro).label,
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
      rowKey={(row) => row.id}
      loading={isLoading}
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
            <Icon name="add" size={18} /> Nueva plantilla
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
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
      }
    />
  )
}