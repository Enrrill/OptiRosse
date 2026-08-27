import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Pagination } from '@/components/data/Pagination'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { estadoActivo } from '@/lib/constants/choices'
import type { Marca } from '@/types/models'

interface MarcasTableProps {
  marcas: Marca[]
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
  showInactivas: boolean
  onToggleInactivas: (value: boolean) => void
  canManage: boolean
  onEdit: (marca: Marca) => void
  onToggleEstado: (marca: Marca) => void
  onNuevo: () => void
}

export function MarcasTable({
  marcas,
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
  showInactivas,
  onToggleInactivas,
  canManage,
  onEdit,
  onToggleEstado,
  onNuevo,
}: MarcasTableProps) {
  const columns: Column<Marca>[] = [
    { key: 'nombre', header: 'Nombre', cell: (row) => <span className="font-medium">{row.nombre}</span> },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) =>
        canManage ? (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Editar marca" onClick={() => onEdit(row)}>
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
                    aria-label={row.activo ? 'Desactivar marca' : 'Reactivar marca'}
                    onClick={() => onToggleEstado(row)}
                  >
                    <Icon name={row.activo ? 'visibility_off' : 'restart_alt'} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null,
    },
  ]

  return (
    <DataTable<Marca>
      columns={columns}
      data={marcas}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las marcas') : null}
      onRetry={onRetry}
      emptyTitle={showInactivas ? 'No hay marcas inactivas' : 'No hay marcas'}
      emptyDescription="Crea tu primera marca para organizarla en tus productos."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nueva marca
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nombre..."
          searchId="search-marcas"
          quickFilters={
            canManage ? (
              <FilterChip
                id="toggle-inactivas-marcas"
                checked={showInactivas}
                onCheckedChange={onToggleInactivas}
                label="Mostrar inactivas"
                activeLabel="Mostrando inactivas"
              />
            ) : undefined
          }
        />
      }
      footer={
        <Pagination
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
