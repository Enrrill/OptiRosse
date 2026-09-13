import { Pencil, EyeOff, RotateCcw } from 'lucide-react'
import { DataTable, type AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { estadoActivo } from '@/lib/constants/choices'
import type { MetodoPago } from '@/types/models'

interface MetodosTableProps {
  metodos: MetodoPago[]
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
  onEdit: (metodo: MetodoPago) => void
  onToggleEstado: (metodo: MetodoPago) => void
}

export function MetodosTable({
  metodos,
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
  onEdit,
  onToggleEstado,
}: MetodosTableProps) {
  const columns: ColumnDef<MetodoPago>[] = [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
    { accessorKey: 'moneda', header: 'Moneda', cell: ({ row }) => <span className="text-on-surface-variant">{row.original.moneda}</span> },
    {
      accessorKey: 'requiere_referencia',
      header: 'Requiere referencia',
      cell: ({ row }) =>
        row.original.requiere_referencia ? (
          <Badge variant="neutral" className="bg-secondary-container/25 text-secondary">Sí</Badge>
        ) : (
          <Badge variant="neutral" className="bg-surface-variant/40 text-on-surface-variant">No</Badge>
        ),
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
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0.5">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar método de pago"
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
                  aria-label={row.original.activo ? 'Desactivar método de pago' : 'Reactivar método de pago'}
                  onClick={() => onToggleEstado(row.original)}
                >
                  {row.original.activo ? <EyeOff size={18} /> : <RotateCcw size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{row.original.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ]

  return (
    <DataTable<MetodoPago>
      columns={columns}
      data={metodos}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los métodos de pago') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay métodos de pago inactivos' : 'No hay métodos de pago'}
      emptyDescription="Crea tu primer método de pago para registrar pagos."
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nombre o moneda..."
          searchId="search-metodos"
          quickFilters={
            <FilterChip
              id="toggle-inactivos-metodos"
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
