import { useNavigate } from 'react-router'
import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { estadoActivo } from '@/lib/constants/choices'
import { formatDate, formatMoney, formatNumber } from '@/lib/format'
import type { Cliente } from '@/types/models'

interface ClientesTableProps {
  clientes: Cliente[]
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

  const columns: Column<Cliente>[] = [
    {
      key: 'nombre_comercial',
      header: 'Cliente',
      cell: (row) => (
        <div>
          <p className="font-medium text-on-surface">{row.nombre_comercial}</p>
          <p className="text-xs text-on-surface-variant">{row.razon_social}</p>
        </div>
      ),
    },
    {
      key: 'identificacion_fiscal',
      header: 'RIF',
      cell: (row) => <span className="font-mono text-xs">{row.identificacion_fiscal}</span>,
    },
    {
      key: 'correo',
      header: 'Correo',
      cell: (row) => <span className="block max-w-[220px] truncate">{row.correo}</span>,
    },
    { key: 'telefono', header: 'Teléfono' },
    {
      key: 'limite_credito',
      header: 'Límite de crédito',
      align: 'right',
      cell: (row) => formatMoney(row.limite_credito),
    },
    {
      key: 'dias_credito',
      header: 'Días de crédito',
      align: 'right',
      cell: (row) => formatNumber(row.dias_credito),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    { key: 'creado_en', header: 'Creado', cell: (row) => formatDate(row.creado_en) },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) => (
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
                    navigate(`/clientes/${row.id}`)
                  }}
                >
                  <Icon name="visibility" size={18} />
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
                      onEdit(row)
                    }}
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
                    aria-label={row.activo ? 'Desactivar cliente' : 'Reactivar cliente'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleEstado(row)
                    }}
                  >
                    <Icon name={row.activo ? 'person_off' : 'restart_alt'} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
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
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los clientes') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay clientes inactivos' : 'No hay clientes'}
      emptyDescription="Agrega tu primer cliente para comenzar a gestionar pedidos y créditos."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nuevo cliente
          </Button>
        ) : undefined
      }
      onRowClick={(row) => navigate(`/clientes/${row.id}`)}
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, RIF o correo..."
              className="pl-9"
            />
          </div>
          {canManage && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
              <Switch checked={showInactivos} onCheckedChange={onToggleInactivos} />
              Mostrar inactivos
            </label>
          )}
        </div>
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}
