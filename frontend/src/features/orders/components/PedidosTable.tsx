import { User, Heart } from 'lucide-react'
import { DataTable } from '@/components/data/DataTable'
import type { AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
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
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { ESTADO_PEDIDO, choice } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { Cliente, Pedido } from '@/types/models'

interface PedidosTableProps {
  pedidos: Pedido[]
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
  estadoFiltro: string
  onEstadoChange: (value: string) => void
  tipoDestinatarioFiltro: string
  onTipoDestinatarioChange: (value: string) => void
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
  onPageSizeChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  estadoFiltro,
  onEstadoChange,
  tipoDestinatarioFiltro,
  onTipoDestinatarioChange,
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
  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: 'numero_pedido',
      header: 'N.º pedido',
      cell: ({row}) => (
        <span className="font-mono text-sm font-medium text-on-surface">{row.original.numero_pedido}</span>
      ),
    },
    {
      accessorKey: 'destinatario',
      header: 'Destinatario',
      cell: ({row}) => {
        const esCliente = !!row.original.cliente_detalle
        const nombre = esCliente
          ? row.original.cliente_detalle?.nombre_comercial
          : row.original.paciente_detalle?.nombre_completo
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${esCliente ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
              {esCliente ? <User size={10} /> : <Heart size={10} />}
              {esCliente ? 'Cliente' : 'Paciente'}
            </span>
            <span className="font-medium text-on-surface">{nombre ?? '—'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'usuario',
      header: 'Usuario',
      cell: ({row}) => <span className="text-on-surface-variant">{row.original.usuario_nombre}</span>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({row}) => <StatusBadge display={choice(ESTADO_PEDIDO, row.original.estado)} />,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { className: 'text-right' },
      cell: ({row}) => <span className="font-medium">{formatMoney(row.original.total)}</span>,
    },
    {
      accessorKey: 'creado_en',
      header: 'Fecha',
      cell: ({row}) => <span className="text-on-surface-variant">{formatDate(row.original.creado_en)}</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({row}) => {
        const editable = canManage && row.original.estado === 'borrador'
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
                      onVer(row.original)
                    }}
                  >
                    <Eye size={18} />
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
                          onEditar(row.original)
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
                        aria-label="Eliminar pedido"
                        className="text-error hover:bg-error-container/40 hover:text-error"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEliminar(row.original)
                        }}
                      >
                        <Trash2 size={18} />
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

  const activeCount = [
    estadoFiltro !== '',
    tipoDestinatarioFiltro !== '',
    clienteFiltro !== null,
    fechaDesde !== '',
    fechaHasta !== '',
  ].filter(Boolean).length

  const activeFiltersList = [
    estadoFiltro
      ? {
          id: 'estado',
          label: 'Estado',
          valueDisplay: choice(ESTADO_PEDIDO, estadoFiltro)?.label ?? '',
          onRemove: () => onEstadoChange(''),
        }
      : null,
    tipoDestinatarioFiltro
      ? {
          id: 'tipoDestinatario',
          label: 'Tipo',
          valueDisplay: tipoDestinatarioFiltro === 'cliente' ? 'Cliente' : 'Paciente',
          onRemove: () => onTipoDestinatarioChange(''),
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
    onTipoDestinatarioChange('')
    onClienteChange(null)
    onFechaDesdeChange('')
    onFechaHastaChange('')
  }

  const hayFiltros = search !== '' || activeCount > 0

  return (
    <DataTable<Pedido>
      columns={columns}
      data={pedidos}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los pedidos') : null}
      onRetry={onRetry}
      onRowClick={onVer}
      emptyTitle={hayFiltros ? 'No hay pedidos con estos filtros' : 'No hay pedidos'}
      emptyDescription="Crea el primer pedido para comenzar a gestionar el ciclo de venta."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Plus size={18} /> Nuevo pedido
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por N.º o destinatario..."
          searchId="search-pedidos"
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
                    {Object.entries(ESTADO_PEDIDO).map(([value, item]) => (
                      <SelectItem key={value} value={value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Tipo destinatario</label>
                <Select
                  value={tipoDestinatarioFiltro || 'todos'}
                  onValueChange={(value) => onTipoDestinatarioChange(value === 'todos' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="cliente">Clientes</SelectItem>
                    <SelectItem value="paciente">Pacientes</SelectItem>
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

              <DateRangePicker
                fechaDesde={fechaDesde}
                onFechaDesdeChange={onFechaDesdeChange}
                fechaHasta={fechaHasta}
                onFechaHastaChange={onFechaHastaChange}
                idPrefix="pedidos-fecha"
              />
            </div>
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
