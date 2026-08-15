import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/data/EmptyState'
import { Icon } from '@/components/Icon'
import { useApiQuery } from '@/hooks/useApi'
import { useToast } from '@/store/useToast'
import { ApiError } from '@/lib/api/errors'
import { choice, TIPO_DOCUMENTO } from '@/lib/constants/choices'
import { PLANTILLAS } from '@/lib/api/endpoints'
import { useGenerarDocumento, type FormatoDocumento } from '@/hooks/useGenerarDocumento'
import type { PlantillaDocumento, TipoDocumento } from '@/types/models'

interface GenerarDocumentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Id del objeto de negocio a documentar (Pedido o Pago según el tipo). */
  objetoId: number
  /** Tipos de documento disponibles para este objeto (factura/orden/nota → pedido; recibo → pago). */
  tiposPermitidos: TipoDocumento[]
}

export function GenerarDocumentoDialog({
  open,
  onOpenChange,
  objetoId,
  tiposPermitidos,
}: GenerarDocumentoDialogProps) {
  const toast = useToast()
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('')
  const [formato, setFormato] = useState<FormatoDocumento>('pdf')

  const { data, isLoading } = useApiQuery<PlantillaDocumento[]>(
    ['plantillas', 'activas'],
    open ? PLANTILLAS : null,
    { params: { activo: true, page_size: 100 } },
  )

  const plantillas = useMemo(
    () =>
      (data?.data ?? []).filter((p) =>
        tiposPermitidos.includes(p.tipo_documento),
      ),
    [data?.data, tiposPermitidos],
  )

  const plantillaPorTipo = useMemo(() => {
    const map = new Map<string, PlantillaDocumento>()
    for (const p of plantillas) {
      if (!map.has(p.tipo_documento)) map.set(p.tipo_documento, p)
    }
    return map
  }, [plantillas])

  const plantillaSeleccionada = plantillaPorTipo.get(tipoSeleccionado) ?? null
  const generar = useGenerarDocumento(plantillaSeleccionada?.id ?? null)

  const handleSubmit = async () => {
    if (!plantillaSeleccionada || !tipoSeleccionado) return
    try {
      await generar.mutateAsync({
        objetoId,
        formato,
      })
      toast.success(`${plantillaSeleccionada.nombre} descargado correctamente`)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.defaultMessage : 'No se pudo generar el documento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Generar documento</DialogTitle>
          <DialogDescription>
            Elige el tipo de documento y el formato a descargar.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-on-surface-variant">
            <Icon name="progress_activity" size={20} className="animate-spin" />
            Cargando plantillas...
          </div>
        ) : plantillas.length === 0 ? (
          <EmptyState
            icon="description"
            title="No hay plantillas disponibles"
            description="No existe una plantilla activa para los tipos de documento de este objeto."
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo de documento</Label>
              <Select value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent>
                  {plantillas.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.tipo_documento}>
                      {choice(TIPO_DOCUMENTO, plantilla.tipo_documento)?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Formato</Label>
              <Select value={formato} onValueChange={(v) => setFormato(v as FormatoDocumento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low/50 p-3">
              <p className="text-xs text-on-surface-variant">
                Se generará con la plantilla{' '}
                <span className="font-medium text-on-surface">
                  {plantillaSeleccionada?.nombre ?? '—'}
                </span>
                .
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" disabled={generar.isPending} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!plantillaSeleccionada || plantillas.length === 0}
            loading={generar.isPending}
            onClick={handleSubmit}
          >
            {!generar.isPending && <Icon name="download" size={18} />}
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}