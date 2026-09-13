import { Pencil, EyeOff, RotateCcw, Plus } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  const columns: ColumnDef<Marca>[] = [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
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
                  <Button variant="ghost" size="icon" aria-label="Editar marca" onClick={() => onEdit(row.original)}>
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
                    aria-label={row.original.activo ? 'Desactivar marca' : 'Reactivar marca'}
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
    <DataTable<Marca>
      columns={columns}
      data={marcas}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las marcas') : null}
      onRetry={onRetry}
      emptyTitle={showInactivas ? 'No hay marcas inactivas' : 'No hay marcas'}
      emptyDescription="Crea tu primera marca para organizarla en tus productos."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nueva marca
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
