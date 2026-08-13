import { formatMoney } from '@/lib/format'

interface PedidoTotalesPanelProps {
  subtotal: number
  impuesto: number
  total: number
  note?: string
}

export function PedidoTotalesPanel({ subtotal, impuesto, total, note }: PedidoTotalesPanelProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low/60 p-4">
      <div className="flex items-center justify-between text-sm text-on-surface-variant">
        <span>Subtotal</span>
        <span className="font-medium text-on-surface">{formatMoney(subtotal)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-sm text-on-surface-variant">
        <span>Impuesto (IVA 16%)</span>
        <span className="font-medium text-on-surface">{formatMoney(impuesto)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
          Total
        </span>
        <span className="font-heading text-xl font-bold text-on-surface">{formatMoney(total)}</span>
      </div>
      {note && <p className="mt-2 text-xs text-on-surface-variant">{note}</p>}
    </div>
  )
}