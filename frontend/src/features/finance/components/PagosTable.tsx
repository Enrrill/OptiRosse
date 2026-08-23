import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { choice, ESTADO_PAGO } from '@/lib/constants/choices'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { Cliente, MetodoPago, Pago } from '@/types/models'

interface PagosTableProps {
  pagos: Pago[]
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
  metodos: MetodoPago[]
  metodoFiltro: number | null
  onMetodoChange: (value: number | null) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  onVer: (pago: Pago) => void
  onAprobar: (pago: Pago) => void
  onRechazar: (pago: Pago) => void
  onNuevo: () => void
}

export function PagosTable({
  pagos,
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
  metodos,
  metodoFiltro,
  onMetodoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onVer,
  onAprobar,
  onRechazar,
  onNuevo,
}: PagosTableProps) {
  const columns: Column<Pago>[] = [
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (row) => (
        <span className="font-medium text-on-surface">{row.cliente_detalle.nombre_comercial}</span>
      ),
    },
    {
      key: 'pedido_numero',
      header: 'N.º pedido',
      cell: (row) =>
        row.pedido_numero ? (
          <span className="font-mono text-sm text-primary">{row.pedido_numero}</span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'metodo',
      header: 'Método',
      cell: (row) => <span className="text-on-surface-variant">{row.metodo_pago_detalle}</span>,
    },
    {
      key: 'monto',
      header: 'Monto',
      align: 'right',
      cell: (row) => <span className="font-medium">{formatMoney(row.monto)}</span>,
    },
    {
      key: 'tasa_cambio',
      header: 'Tasa',
      align: 'right',
      cell: (row) => <span className="text-on-surface-variant">{Number(row.tasa_cambio)}</span>,
    },
    {
      key: 'numero_referencia',
      header: 'Referencia',
      cell: (row) =>
        row.numero_referencia ? (
          <span className="font-mono text-xs text-on-surface">{row.numero_referencia}</span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={choice(ESTADO_PAGO, row.estado)} />,
    },
    {
      key: 'fecha_pago',
      header: 'Fecha',
      cell: (row) => <span className="text-on-surface-variant">{formatDateTime(row.fecha_pago)}</span>,
    },
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
                  aria-label="Ver pago"
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
            {row.estado === 'pendiente' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Aprobar pago"
                      className="text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAprobar(row)
                      }}
                    >
                      <Icon name="check_circle" size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Aprobar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Rechazar pago"
                      className="text-error hover:bg-error-container/40 hover:text-error"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRechazar(row)
                      }}
                    >
                      <Icon name="cancel" size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rechazar</TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      ),
    },
  ]

  const activeCount = [
    estadoFiltro !== '',
    clienteFiltro !== null,
    metodoFiltro !== null,
    fechaDesde !== '',
    fechaHasta !== '',
  ].filter(Boolean).length

  const activeFiltersList = [
    estadoFiltro
      ? {
          id: 'estado',
          label: 'Estado',
          valueDisplay: choice(ESTADO_PAGO, estadoFiltro).label,
          onRemove: () => onEstadoChange(''),
        }
      : null,
    clienteFiltro !== null
      ? {
          id: 'cliente',
          label: 'Cliente',
          valueDisplay: clientes.find((c) => c.id === clienteFiltro)?.nombre_comercial ?? String(clienteFiltro),
          onRemove: () => onClienteChange(null),
        }
      : null,
    metodoFiltro !== null
      ? {
          id: 'metodo',
          label: 'Método',
          valueDisplay: metodos.find((m) => m.id === metodoFiltro)?.nombre ?? String(metodoFiltro),
          onRemove: () => onMetodoChange(null),
        }
      : null,
    fechaDesde
      ? {
          id: 'fechaDesde',
          label: 'Desde',
          valueDisplay: fechaDesde,
          onRemove: () => onFechaDesdeChange(''),
        }
      : null,
    fechaHasta
      ? {
          id: 'fechaHasta',
          label: 'Hasta',
          valueDisplay: fechaHasta,
          onRemove: () => onFechaHastaChange(''),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onEstadoChange('')
    onClienteChange(null)
    onMetodoChange(null)
    onFechaDesdeChange('')
    onFechaHastaChange('')
  }

  const hayFiltros = search !== '' || activeCount > 0

  return (
    <DataTable<Pago>
      columns={columns}
      data={pagos}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los pagos') : null}
      onRetry={onRetry}
      onRowClick={onVer}
      emptyTitle={hayFiltros ? 'No hay pagos con estos filtros' : 'No hay pagos'}
      emptyDescription="Registra el primer pago de un cliente para comenzar."
      emptyAction={
        <Button onClick={onNuevo}>
          <Icon name="add" size={18} /> Registrar pago
        </Button>
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por cliente o referencia..."
          searchId="search-pagos"
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Estado</label>
                <Select
                  value={estadoFiltro || 'todos'}
                  onValueChange={(value) => onEstadoChange(value === 'todos' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    {Object.entries(ESTADO_PAGO).map(([value, item]) => (
                      <SelectItem key={value} value={value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Cliente</label>
                <Select
                  value={clienteFiltro != null ? String(clienteFiltro) : 'todos'}
                  onValueChange={(value) => onClienteChange(value === 'todos' ? null : Number(value))}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los clientes" />
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Método de pago</label>
                <Select
                  value={metodoFiltro != null ? String(metodoFiltro) : 'todos'}
                  onValueChange={(value) => onMetodoChange(value === 'todos' ? null : Number(value))}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los métodos</SelectItem>
                    {metodos.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DateRangePicker
                fechaDesde={fechaDesde}
                onFechaDesdeChange={onFechaDesdeChange}
                fechaHasta={fechaHasta}
                onFechaHastaChange={onFechaHastaChange}
                idPrefix="pagos-fecha"
              />
            </div>
          }
        />
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}