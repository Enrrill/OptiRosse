import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { choice, ACCION_AUDITORIA, TABLA_AUDITORIA } from '@/lib/constants/choices'
import { formatDateTime } from '@/lib/format'
import type { RegistroAuditoria } from '@/types/models'

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{label}</p>
      {children}
    </div>
  )
}

interface RegistroDetalleDialogProps {
  registro: RegistroAuditoria | null
  onOpenChange: (open: boolean) => void
}

export function RegistroDetalleDialog({ registro, onOpenChange }: RegistroDetalleDialogProps) {
  const accion = choice(ACCION_AUDITORIA, registro?.accion)
  const tabla = choice(TABLA_AUDITORIA, registro?.tabla_afectada)

  const nombreUsuario = registro?.usuario_detalle
    ? [registro.usuario_detalle.nombre, registro.usuario_detalle.apellido]
        .filter(Boolean)
        .join(' ')
        .trim() || registro.usuario_detalle.nombre_usuario
    : 'Sistema'

  return (
    <Dialog open={registro != null} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del registro de auditoría</DialogTitle>
          <DialogDescription>
            Acción registrada el {formatDateTime(registro?.creado_en)}.
          </DialogDescription>
        </DialogHeader>

        {registro && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Acción">
                <span className={`inline-flex ${accion?.badge ?? ''} rounded-full px-2.5 py-1 text-sm font-medium`}>
                  {registro.accion_display}
                </span>
              </Campo>
              <Campo label="Módulo">
                <span className={`inline-flex ${tabla?.badge ?? ''} rounded-full px-2.5 py-1 text-sm font-medium`}>
                  {registro.tabla_display}
                </span>
              </Campo>
              <Campo label="Usuario">
                <p className="text-sm font-medium text-on-surface">{nombreUsuario}</p>
                {registro.usuario_detalle && (
                  <p className="text-xs text-on-surface-variant">@{registro.usuario_detalle.nombre_usuario}</p>
                )}
              </Campo>
              <Campo label="ID del objeto">
                <p className="font-mono text-sm text-on-surface">
                  {registro.objeto_id != null ? `#${registro.objeto_id}` : '—'}
                </p>
              </Campo>
              <Campo label="Dirección IP">
                <p className="font-mono text-sm text-on-surface">{registro.direccion_ip || '—'}</p>
              </Campo>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Detalles (JSON)
              </p>
              {registro.detalles ? (
                <pre className="max-h-64 overflow-auto rounded-lg bg-surface-container/60 p-3 font-mono text-xs leading-relaxed text-on-surface">
                  {JSON.stringify(registro.detalles, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-on-surface-variant">Sin detalles adicionales.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}