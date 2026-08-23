import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { ESTADO_PEDIDO, choice } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { Cliente, Pedido } from '@/types/models'

interface PedidosTableProps {
  pedidos: Pedido[]
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
  estadoFiltro: string
  onEstadoChange: (value: string) => void
  clientes: Cliente[]
  clienteFiltro: number | null
  onClienteChange: (value: number | null) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  canManage: boolean
  onVer: (pedido: Pedido) => void
  onEditar: (pedido: Pedido) => void
  onEliminar: (pedido: Pedido) => void
  onNuevo: () => void
}

export function PedidosTable({
  pedidos,
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
  estadoFiltro,
  onEstadoChange,
  clientes,
  clienteFiltro,
  onClienteChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  canManage,
  onVer,
  onEditar,
  onEliminar,
  onNuevo,
}: PedidosTableProps) {
  const columns: Column<Pedido>[] = [
    {
      key: 'numero_pedido',
      header: 'N.º pedido',
      cell: (row) => (
        <span className="font-mono text-sm font-medium text-on-surface">{row.numero_pedido}</span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (row) => (
        <span className="font-medium text-on-surface">{row.cliente_detalle.nombre_comercial}</span>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      cell: (row) => <span className="text-on-surface-variant">{row.usuario_nombre}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={choice(ESTADO_PEDIDO, row.estado)} />,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      cell: (row) => <span className="font-medium">{formatMoney(row.total)}</span>,
    },
    {
      key: 'creado_en',
      header: 'Fecha',
      cell: (row) => <span className="text-on-surface-variant">{formatDate(row.creado_en)}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) => {
        const editable = canManage && row.estado === 'borrador'
        return (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ver pedido"
                    onClick={(e) => {
                      e.stopPropagation()
                      onVer(row)
                    }}
                  >
                    <Icon name="visibility" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver detalle</TooltipContent>
              </Tooltip>
              {editable && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar pedido"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditar(row)
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
                        aria-label="Eliminar pedido"
                        className="text-error hover:bg-error-container/40 hover:text-error"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEliminar(row)
                        }}
                      >
                        <Icon name="delete" size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar</TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  const hayFiltros =
    search !== '' || estadoFiltro !== '' || clienteFiltro != null || fechaDesde !== '' || fechaHasta !== ''

  return (
    <DataTable<Pedido>
      columns={columns}
      data={pedidos}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los pedidos') : null}
      onRetry={onRetry}
      onRowClick={onVer}
      emptyTitle={hayFiltros ? 'No hay pedidos con estos filtros' : 'No hay pedidos'}
      emptyDescription="Crea el primer pedido para comenzar a gestionar el ciclo de venta."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nuevo pedido
          </Button>
        ) : undefined
      }
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <Input
                id="search-pedidos"
                name="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por N.º o cliente..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={estadoFiltro || 'todos'}
                onValueChange={(value) => onEstadoChange(value === 'todos' ? '' : value)}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {Object.entries(ESTADO_PEDIDO).map(([value, item]) => (
                    <SelectItem key={value} value={value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={clienteFiltro != null ? String(clienteFiltro) : 'todos'}
                onValueChange={(value) => onClienteChange(value === 'todos' ? null : Number(value))}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los clientes</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre_comercial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="pedidos-fecha-desde" className="flex items-center gap-2 text-sm text-on-surface-variant">
              Desde
              <Input
                id="pedidos-fecha-desde"
                name="fecha_desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="w-40"
              />
            </label>
            <label htmlFor="pedidos-fecha-hasta" className="flex items-center gap-2 text-sm text-on-surface-variant">
              Hasta
              <Input
                id="pedidos-fecha-hasta"
                name="fecha_hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange(e.target.value)}
                className="w-40"
              />
            </label>
          </div>
        </div>
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}