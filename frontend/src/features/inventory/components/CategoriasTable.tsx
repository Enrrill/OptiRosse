import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Pagination } from '@/components/data/Pagination'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { choice, estadoActivo, TIPO_PRODUCTO } from '@/lib/constants/choices'
import type { Categoria } from '@/types/models'

interface CategoriasTableProps {
  categorias: Categoria[]
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
  showInactivas: boolean
  onToggleInactivas: (value: boolean) => void
  canManage: boolean
  onEdit: (categoria: Categoria) => void
  onToggleEstado: (categoria: Categoria) => void
  onNuevo: () => void
}

export function CategoriasTable({
  categorias,
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
  showInactivas,
  onToggleInactivas,
  canManage,
  onEdit,
  onToggleEstado,
  onNuevo,
}: CategoriasTableProps) {
  const columns: Column<Categoria>[] = [
    { key: 'nombre', header: 'Nombre', cell: (row) => <span className="font-medium">{row.nombre}</span> },
    {
      key: 'tipo_producto',
      header: 'Tipo',
      cell: (row) => <StatusBadge display={choice(TIPO_PRODUCTO, row.tipo_producto)} />,
    },
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
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar categoría"
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
                    aria-label={row.activo ? 'Desactivar categoría' : 'Reactivar categoría'}
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
    <DataTable<Categoria>
      columns={columns}
      data={categorias}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las categorías') : null}
      onRetry={onRetry}
      emptyTitle={showInactivas ? 'No hay categorías inactivas' : 'No hay categorías'}
      emptyDescription="Crea tu primera categoría para organizar el inventario."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nueva categoría
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nombre..."
          searchId="search-categorias"
          quickFilters={
            canManage ? (
              <FilterChip
                id="toggle-inactivas-categorias"
                checked={showInactivas}
                onCheckedChange={onToggleInactivas}
                label="Mostrar inactivas"
                activeLabel="Mostrando inactivas"
              />
            ) : undefined
          }
          actions={
            canManage ? (
              <Button onClick={onNuevo}>
                <Icon name="add" size={18} /> Nueva categoría
              </Button>
            ) : undefined
          }
        />
      }
      footer={
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />
      }
    />
  )
}