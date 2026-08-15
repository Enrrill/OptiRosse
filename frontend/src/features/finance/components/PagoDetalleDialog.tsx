import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Icon } from '@/components/Icon'
import { choice, ESTADO_PAGO } from '@/lib/constants/choices'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { Pago } from '@/types/models'

interface PagoDetalleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pago: Pago | null
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-right text-sm font-medium text-on-surface">{children}</span>
    </div>
  )
}

export function PagoDetalleDialog({ open, onOpenChange, pago }: PagoDetalleDialogProps) {
  if (!pago) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Pago #{pago.id}</DialogTitle>
          <DialogDescription>
            {pago.cliente_detalle.nombre_comercial} · {formatDateTime(pago.fecha_pago)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm text-on-surface-variant">Estado</span>
            <StatusBadge display={choice(ESTADO_PAGO, pago.estado)} />
          </div>
          <Fila label="Cliente">{pago.cliente_detalle.nombre_comercial}</Fila>
          <Fila label="Pedido">{pago.pedido_numero ?? '—'}</Fila>
          <Fila label="Método de pago">{pago.metodo_pago_detalle}</Fila>
          <Fila label="Monto">{formatMoney(pago.monto)}</Fila>
          <Fila label="Tasa de cambio">{Number(pago.tasa_cambio)}</Fila>
          <Fila label="Número de referencia">
            {pago.numero_referencia || '—'}
          </Fila>
          <Fila label="Fecha de pago">{formatDateTime(pago.fecha_pago)}</Fila>
          {pago.motivo_rechazo && (
            <div className="rounded-xl border border-error-container/60 bg-error-container/20 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-error">
                <Icon name="block" size={18} /> Motivo de rechazo
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-on-surface">
                {pago.motivo_rechazo}
              </p>
            </div>
          )}
          {pago.comprobante_imagen_url && (
            <Fila label="Comprobante">
              <a
                href={pago.comprobante_imagen_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Ver comprobante
              </a>
            </Fila>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}