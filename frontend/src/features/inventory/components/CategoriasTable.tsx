import { Pencil, EyeOff, RotateCcw, Plus } from 'lucide-react'
import { DataTable, type AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { choice, estadoActivo, TIPO_PRODUCTO } from '@/lib/constants/choices'
import type { Categoria } from '@/types/models'

interface CategoriasTableProps {
  categorias: Categoria[]
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
}: CategoriasTableProps) {
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
    {
      accessorKey: 'tipo_producto',
      header: 'Tipo',
      cell: ({ row }) => <StatusBadge display={choice(TIPO_PRODUCTO, row.original.tipo_producto)} />,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge display={estadoActivo(row.original.activo)} />,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({ row }) =>
        canManage ? (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar categoría"
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
                    aria-label={row.original.activo ? 'Desactivar categoría' : 'Reactivar categoría'}
                    onClick={() => onToggleEstado(row.original)}
                  >
                    {row.original.activo ? <EyeOff size={18} /> : <RotateCcw size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.original.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
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
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las categorías') : null}
      onRetry={onRetry}
      emptyTitle={showInactivas ? 'No hay categorías inactivas' : 'No hay categorías'}
      emptyDescription="Crea tu primera categoría para organizar el inventario."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nueva categoría
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
