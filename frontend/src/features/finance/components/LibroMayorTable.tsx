import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon } from '@/components/Icon'
import { choice, TIPO_ASIENTO } from '@/lib/constants/choices'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { Cliente, LibroMayorAsiento } from '@/types/models'

interface LibroMayorTableProps {
  asientos: LibroMayorAsiento[]
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

  const hayFiltros =
    search !== '' ||
    clienteFiltro != null ||
    tipoFiltro !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== ''

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
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4">
          <div className="relative w-full sm:max-w-sm">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              id="search-libro-mayor"
              name="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por concepto o referencia..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <Select
              value={tipoFiltro || 'todos'}
              onValueChange={(value) => onTipoChange(value === 'todos' ? '' : value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de asiento" />
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
            <label htmlFor="lm-fecha-desde" className="flex items-center gap-2 text-sm text-on-surface-variant">
              Desde
              <Input
                id="lm-fecha-desde"
                name="fecha_desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="w-40"
              />
            </label>
            <label htmlFor="lm-fecha-hasta" className="flex items-center gap-2 text-sm text-on-surface-variant">
              Hasta
              <Input
                id="lm-fecha-hasta"
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