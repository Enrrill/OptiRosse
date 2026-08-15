import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Pagination } from '@/components/data/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { choice, estadoActivo, TIPO_DOCUMENTO } from '@/lib/constants/choices'
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
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={tipoFiltro} onValueChange={onTipoChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tipo de documento" />
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
            <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
              <Switch checked={showInactivos} onCheckedChange={onToggleInactivos} />
              Mostrar inactivos
            </label>
            {canEdit && (
              <Button onClick={onNuevo}>
                <Icon name="add" size={18} /> Nueva plantilla
              </Button>
            )}
          </div>
        </div>
      }
      footer={
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
      }
    />
  )
}