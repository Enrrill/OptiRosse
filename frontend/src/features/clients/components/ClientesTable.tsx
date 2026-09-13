import { useNavigate } from 'react-router'
import { DataTable } from '@/components/data/DataTable'
import type { AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Pencil, UserX, RotateCcw, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/useAuth'
import { estadoActivo } from '@/lib/constants/choices'
import { formatDate, formatMoney, formatNumber, formatRIF, formatPhone, formatName, formatEmail } from '@/lib/format'
import { FilterChip } from '@/components/ui/FilterChip'
import type { Cliente } from '@/types/models'

interface ClientesTableProps {
  clientes: Cliente[]
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
  onEdit: (cliente: Cliente) => void
  onToggleEstado: (cliente: Cliente) => void
  onNuevo: () => void
}

export function ClientesTable({
  clientes,
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
  onNuevo,
}: ClientesTableProps) {
  const navigate = useNavigate()
  const canManage = useAuthStore((s) => s.user?.rol) === 'administrador'

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'nombre_comercial',
      header: 'Cliente',
      cell: ({row}) => (
        <div>
          <p className="font-medium text-on-surface">{formatName(row.original.nombre_comercial)}</p>
          <p className="text-xs text-on-surface-variant">{formatName(row.original.razon_social)}</p>
        </div>
      ),
    },
    {
      accessorKey: 'identificacion_fiscal',
      header: 'RIF',
      cell: ({row}) => <span className="font-mono text-xs font-semibold">{formatRIF(row.original.identificacion_fiscal)}</span>,
    },
    {
      accessorKey: 'correo',
      header: 'Correo',
      cell: ({row}) => <span className="block max-w-[320px] truncate text-on-surface-variant">{formatEmail(row.original.correo)}</span>,
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({row}) => <span className="text-on-surface-variant whitespace-nowrap">{formatPhone(row.original.telefono)}</span>,
    },
    {
      accessorKey: 'limite_credito',
      header: 'Límite de crédito',
      meta: { className: 'text-right' },
      cell: ({row}) => row.original.limite_credito != null ? formatMoney(row.original.limite_credito) : '—',
    },
    {
      accessorKey: 'dias_credito',
      header: 'Días de crédito',
      meta: { className: 'text-right' },
      cell: ({row}) => row.original.dias_credito != null ? formatNumber(row.original.dias_credito) : '—',
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({row}) => <StatusBadge display={estadoActivo(row.original.activo)} />,
    },
    { accessorKey: 'creado_en', header: 'Creado', cell: ({row}) => formatDate(row.original.creado_en) },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({row}) => (
        <div className="flex items-center justify-end gap-0.5">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ver cliente"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/clientes/${row.original.id}`)
                  }}
                >
                  <Eye size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver cliente</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {canManage && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar cliente"
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
                    aria-label={row.original.activo ? 'Desactivar cliente' : 'Reactivar cliente'}
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
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable<Cliente>
      columns={columns}
      data={clientes}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los clientes') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay clientes inactivos' : 'No hay clientes'}
      emptyDescription="Agrega tu primer cliente para comenzar a gestionar pedidos y créditos."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nuevo cliente
          </Button>
        ) : undefined
      }
      onRowClick={(row) => navigate(`/clientes/${row.id}`)}
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nombre comercial, RIF o correo..."
          searchId="search-clientes"
          quickFilters={
            canManage ? (
              <FilterChip
                id="toggle-inactivos-clientes"
                checked={showInactivos}
                onCheckedChange={onToggleInactivos}
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
