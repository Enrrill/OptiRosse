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
      header: 'N.º pedido',
      cell: (r) => <span className="font-mono text-xs text-primary">{r.numero_pedido}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (r) => <span className="font-semibold">{r.cliente_nombre}</span>,
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
      cell: (r) => <span className="font-bold">{formatMoney(r.total)}</span>,
    },
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (r) => <span className="text-on-surface-variant">{formatDate(r.creado_en)}</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={pedidos}
      rowKey={(r) => r.id}
      onRowClick={() => navigate('/pedidos')}
      emptyTitle="Sin pedidos recientes"
      className="border-0 shadow-none"
    />
  )
}
