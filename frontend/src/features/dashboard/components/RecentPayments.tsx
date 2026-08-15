import { useNavigate } from 'react-router'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { choice, ESTADO_PAGO } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { PagoResumen } from '@/types/models'

export function RecentPayments({ pagos }: { pagos: PagoResumen[] }) {
  const navigate = useNavigate()

  const columns: Column<PagoResumen>[] = [
    {
      key: 'cliente',
      header: 'Cliente',
      cell: (r) => <span className="font-semibold">{r.cliente_nombre}</span>,
    },
    {
      key: 'metodo',
      header: 'Método',
      cell: (r) => <span className="text-on-surface-variant">{r.metodo_pago_nombre}</span>,
    },
    {
      key: 'monto',
      header: 'Monto',
      align: 'right',
      cell: (r) => <span className="font-bold">{formatMoney(r.monto)}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      cell: (r) => <StatusBadge display={choice(ESTADO_PAGO, r.estado)} />,
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
      data={pagos}
      rowKey={(r) => r.id}
      onRowClick={() => navigate('/finanzas?tab=pagos')}
      emptyTitle="Sin pagos recientes"
      className="border-0 shadow-none"
    />
  )
}
