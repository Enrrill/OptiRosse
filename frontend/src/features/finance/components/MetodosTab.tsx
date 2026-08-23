import { useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { useMetodosPago } from '../hooks/useMetodosPago'
import { useDesactivarMetodoPago, useReactivarMetodoPago } from '../hooks/useMetodoPagoMutations'
import { MetodosTable } from './MetodosTable'
import { MetodoPagoFormDialog } from './MetodoPagoFormDialog'
import type { MetodoPago } from '@/types/models'

interface MetodosTabProps {
  triggerNuevo?: number
}

export function MetodosTab({ triggerNuevo }: MetodosTabProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [showInactivos, setShowInactivos] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MetodoPago | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<MetodoPago | null>(null)

  const [lastTrigger, setLastTrigger] = useState(triggerNuevo)
  if (triggerNuevo !== undefined && triggerNuevo !== lastTrigger) {
    setLastTrigger(triggerNuevo)
    setEditing(null)
    setFormOpen(true)
  }

  const params = useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(showInactivos ? { activo: 'false' as const } : {}),
    }),
    [debouncedSearch, showInactivos],
  )

  const { metodos, isLoading, isError, error, refetch } = useMetodosPago(params)

  const desactivar = useDesactivarMetodoPago(estadoTarget?.id ?? null)
  const reactivar = useReactivarMetodoPago(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (metodo: MetodoPago) => {
    setEditing(metodo)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    if (estadoTarget.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setEstadoTarget(null)
  }

  const esInactivo = estadoTarget != null && !estadoTarget.activo

  return (
    <div className="space-y-4">
      <MetodosTable
        metodos={metodos}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        showInactivos={showInactivos}
        onToggleInactivos={setShowInactivos}
        onEdit={abrirEdicion}
        onToggleEstado={setEstadoTarget}
        onNuevo={abrirNuevo}
      />

      <MetodoPagoFormDialog open={formOpen} onOpenChange={setFormOpen} metodo={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar este método de pago?' : '¿Desactivar este método de pago?'}
        description={
          esInactivo
            ? `${estadoTarget?.nombre} volverá a estar disponible para registrar pagos.`
            : `${estadoTarget?.nombre} dejará de poder usarse en nuevos pagos. Los pagos existentes se conservan.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}