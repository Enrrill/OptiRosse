import { useNavigate } from 'react-router'
import { DataTable, type AppColumnDef as ColumnDef } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { choice, ESTADO_PAGO } from '@/lib/constants/choices'
import { formatDate, formatMoney } from '@/lib/format'
import type { PagoResumen } from '@/types/models'

export function RecentPayments({ pagos }: { pagos: PagoResumen[] }) {
  const navigate = useNavigate()

  const columns: ColumnDef<PagoResumen>[] = [
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
      accessorKey: 'metodo',
      header: 'Método',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">
          {row.original.metodo_pago_nombre}
        </span>
      ),
    },
    {
      accessorKey: 'monto',
      header: 'Monto',
      meta: { className: 'text-right' },
      cell: ({ row }) => <span className="font-bold text-on-surface">{formatMoney(row.original.monto)}</span>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      meta: { className: 'text-center' },
      cell: ({ row }) => <StatusBadge display={choice(ESTADO_PAGO, row.original.estado)} />,
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
      data={pagos}
      onRowClick={() => navigate('/finanzas?tab=pagos')}
      emptyTitle="Sin pagos recientes"
      embedded
    />
  )
}
