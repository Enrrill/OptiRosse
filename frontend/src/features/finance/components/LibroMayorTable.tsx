import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
import { Pagination } from '@/components/data/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { choice, TIPO_ASIENTO } from '@/lib/constants/choices'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { Cliente, LibroMayorAsiento } from '@/types/models'

interface LibroMayorTableProps {
  asientos: LibroMayorAsiento[]
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
  clientes: Cliente[]
  clienteFiltro: number | null
  onClienteChange: (value: number | null) => void
  tipoFiltro: string
  onTipoChange: (value: string) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
}

export function LibroMayorTable({
  asientos,
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
  clientes,
  clienteFiltro,
  onClienteChange,
  tipoFiltro,
  onTipoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
}: LibroMayorTableProps) {
  const esCredito = (row: LibroMayorAsiento) => row.tipo_asiento === 'credito'

  const columns: Column<LibroMayorAsiento>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => <span className="whitespace-nowrap text-on-surface-variant">{formatDateTime(row.creado_en)}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (row) => (
        <span className="font-medium text-on-surface">{row.cliente_detalle.nombre_comercial}</span>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      cell: (row) => <span className="text-on-surface-variant">{row.descripcion}</span>,
    },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (row) => {
        const display = choice(TIPO_ASIENTO, row.tipo_asiento)
        return (
          <span
            className={
              esCredito(row)
                ? 'font-medium text-green-700 dark:text-green-400'
                : 'font-medium text-error'
            }
          >
            {display?.label ?? row.tipo_asiento_display}
          </span>
        )
      },
    },
    {
      key: 'monto',
      header: 'Monto',
      align: 'right',
      cell: (row) => (
        <span className={esCredito(row) ? 'text-green-700 dark:text-green-400' : 'text-error'}>
          {esCredito(row) ? '+' : '−'}
          {formatMoney(row.monto)}
        </span>
      ),
    },
    {
      key: 'pedido',
      header: 'Pedido',
      cell: (row) =>
        row.pedido_numero ? (
          <span className="font-mono text-sm text-primary">{row.pedido_numero}</span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'pago',
      header: 'Pago',
      cell: (row) =>
        row.pago != null ? (
          <span className="font-mono text-sm text-primary">Pago #{row.pago}</span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'saldo_posterior',
      header: 'Saldo posterior',
      align: 'right',
      cell: (row) => {
        const saldo = Number(row.saldo_posterior)
        return (
          <span
            className={
              saldo < 0
                ? 'rounded-md bg-error-container/50 px-2 py-0.5 font-bold text-error'
                : 'font-bold text-on-surface'
            }
          >
            {formatMoney(saldo)}
          </span>
        )
      },
    },
  ]

  const activeCount = [
    clienteFiltro !== null,
    tipoFiltro !== '',
    fechaDesde !== '',
    fechaHasta !== '',
  ].filter(Boolean).length

  const activeFiltersList = [
    clienteFiltro !== null
      ? {
          id: 'cliente',
          label: 'Cliente',
          valueDisplay: clientes.find((c) => c.id === clienteFiltro)?.nombre_comercial ?? String(clienteFiltro),
          onRemove: () => onClienteChange(null),
        }
      : null,
    tipoFiltro
      ? {
          id: 'tipo',
          label: 'Tipo',
          valueDisplay: choice(TIPO_ASIENTO, tipoFiltro)?.label ?? '',
          onRemove: () => onTipoChange(''),
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
    onClienteChange(null)
    onTipoChange('')
    onFechaDesdeChange('')
    onFechaHastaChange('')
  }

  const hayFiltros = search !== '' || activeCount > 0

  return (
    <DataTable<LibroMayorAsiento>
      columns={columns}
      data={asientos}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar el libro mayor') : null}
      onRetry={onRetry}
      emptyTitle={hayFiltros ? 'No hay asientos con estos filtros' : 'No hay movimientos'}
      emptyDescription="Los asientos (pedidos y pagos aprobados) aparecerán aquí."
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por concepto o referencia..."
          searchId="search-libro-mayor"
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
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
                <label className="text-xs font-medium text-on-surface-variant">Tipo de asiento</label>
                <Select
                  value={tipoFiltro || 'todos'}
                  onValueChange={(value) => onTipoChange(value === 'todos' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {Object.entries(TIPO_ASIENTO).map(([value, item]) => (
                      <SelectItem key={value} value={value}>
                        {item.label}
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
                idPrefix="lm-fecha"
              />
            </div>
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