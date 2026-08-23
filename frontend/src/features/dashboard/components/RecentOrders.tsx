import { useNavigate } from 'react-router'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { choice, ESTADO_PEDIDO } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { PedidoResumen } from '@/types/models'

export function RecentOrders({ pedidos }: { pedidos: PedidoResumen[] }) {
  const navigate = useNavigate()

  const columns: Column<PedidoResumen>[] = [
    {
      key: 'numero_pedido',
      header: 'N.º Pedido',
      cell: (r) => (
        <span className="inline-flex items-center rounded-md bg-primary-container/15 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
          {r.numero_pedido}
        </span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase">
            {r.cliente_nombre?.slice(0, 2) || 'CL'}
          </div>
          <span className="font-medium text-on-surface truncate max-w-[120px] sm:max-w-none">
            {r.cliente_nombre}
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      cell: (r) => <StatusBadge display={choice(ESTADO_PEDIDO, r.estado)} />,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      cell: (r) => <span className="font-bold text-on-surface">{formatMoney(r.total)}</span>,
    },
    {
      key: 'fecha',
      header: 'Fecha',
      align: 'right',
      cell: (r) => <span className="text-xs text-on-surface-variant/80">{formatDate(r.creado_en)}</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={pedidos}
      rowKey={(r) => r.id}
      onRowClick={() => navigate('/pedidos')}
      emptyTitle="Sin pedidos recientes"
      embedded
    />
  )
}
