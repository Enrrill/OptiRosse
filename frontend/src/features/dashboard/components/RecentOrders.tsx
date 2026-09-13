import { useNavigate } from 'react-router'
import { DataTable, type ColumnDef } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { choice, ESTADO_PEDIDO } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { PedidoResumen } from '@/types/models'

export function RecentOrders({ pedidos }: { pedidos: PedidoResumen[] }) {
  const navigate = useNavigate()

  const columns: ColumnDef<PedidoResumen>[] = [
    {
      accessorKey: 'numero_pedido',
      header: 'N.º Pedido',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-primary-container/15 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
          {row.original.numero_pedido}
        </span>
      ),
    },
    {
      accessorKey: 'cliente',
      header: 'Cliente',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase">
            {row.original.cliente_nombre?.slice(0, 2) || 'CL'}
          </div>
          <span className="font-medium text-on-surface truncate max-w-[120px] sm:max-w-none">
            {row.original.cliente_nombre}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      meta: { className: 'text-center' },
      cell: ({ row }) => <StatusBadge display={choice(ESTADO_PEDIDO, row.original.estado)} />,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { className: 'text-right' },
      cell: ({ row }) => <span className="font-bold text-on-surface">{formatMoney(row.original.total)}</span>,
    },
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      meta: { className: 'text-right' },
      cell: ({ row }) => <span className="text-xs text-on-surface-variant/80">{formatDate(row.original.creado_en)}</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={pedidos}
      onRowClick={() => navigate('/pedidos')}
      emptyTitle="Sin pedidos recientes"
      embedded
    />
  )
}
