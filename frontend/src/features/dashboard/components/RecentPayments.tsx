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
      key: 'metodo',
      header: 'Método',
      cell: (r) => (
        <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">
          {r.metodo_pago_nombre}
        </span>
      ),
    },
    {
      key: 'monto',
      header: 'Monto',
      align: 'right',
      cell: (r) => <span className="font-bold text-on-surface">{formatMoney(r.monto)}</span>,
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
      align: 'right',
      cell: (r) => <span className="text-xs text-on-surface-variant/80">{formatDate(r.creado_en)}</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={pagos}
      rowKey={(r) => r.id}
      onRowClick={() => navigate('/finanzas?tab=pagos')}
      emptyTitle="Sin pagos recientes"
      embedded
    />
  )
}
