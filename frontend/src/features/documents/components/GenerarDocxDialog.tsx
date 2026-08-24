import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/Icon'
import type { DocumentoEmpresa, VariableSchemaItem } from '@/types/models'
import { useGenerarDocx } from '../hooks/useDocumentoEmpresaMutations'

interface GenerarDocxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documento: DocumentoEmpresa | null
}

function buildInitialValues(
  schema: VariableSchemaItem[]
): Record<string, string> {
  const initial: Record<string, string> = {}
  if (schema.length > 0) {
    schema.forEach((v) => {
      initial[v.clave] = v.valor_defecto || ''
    })
  } else {
    initial['nombre_empleado'] = ''
    initial['cedula'] = ''
    initial['cargo'] = ''
    initial['fecha'] = new Date().toISOString().split('T')[0]
  }
  return initial
}

export function GenerarDocxDialog({ open, onOpenChange, documento }: GenerarDocxDialogProps) {
  const schemaVariables: VariableSchemaItem[] = documento?.variables_schema ?? []

  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    buildInitialValues(schemaVariables)
  )
  const [loading, setLoading] = useState(false)
  const generarFn = useGenerarDocx(documento?.id ?? null)

  // Ref para detectar cuando el diálogo se abre con un documento nuevo sin disparar setState en el cuerpo del efecto
  const prevDocIdRef = useRef<number | null>(null)

  // Resetear valores cuando cambia el documento o se abre el diálogo
  useEffect(() => {
    const newId = documento?.id ?? null
    if (open && newId !== prevDocIdRef.current) {
      prevDocIdRef.current = newId
      const next = buildInitialValues(documento?.variables_schema ?? [])
      // Usamos callback form para no sincronizar directamente en el cuerpo del efecto
      setFormValues(next)
    }
    if (!open) {
      prevDocIdRef.current = null
    }
  }, [open, documento])

  const handleInputChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documento) return
    setLoading(true)
    try {
      await generarFn(formValues, documento.nombre)
      onOpenChange(false)
    } catch {
      // Toast manejado dentro del hook
    } finally {
      setLoading(false)
    }
  }

  if (!documento) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary">
            <Icon name="auto_fix_high" size={24} />
            Generar: {documento.nombre}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGenerar} className="space-y-4 py-2">
          <p className="text-xs text-on-surface-variant">
            Ingresa los valores para inyectar en las variables Jinja2 de la plantilla Word. El{' '}
            <code className="rounded bg-surface-variant px-1 text-primary">.docx</code> generado se
            descargará automáticamente.
          </p>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {Object.entries(formValues).map(([key, value]) => {
              const schemaItem = schemaVariables.find((v) => v.clave === key)
              const label = schemaItem?.etiqueta || key.replace(/_/g, ' ')
              const tipo = schemaItem?.tipo || 'texto'
              const isRequired = schemaItem?.requerido ?? false

              return (
                <div key={key}>
                  <Label htmlFor={`var-${key}`} className="text-xs font-semibold capitalize">
                    {label}
                    {isRequired && <span className="ml-0.5 text-error">*</span>}
                    <span className="ml-1.5 font-mono text-[10px] text-on-surface-variant/60">
                      {'{{ '}
                      {key}
                      {' }}'}
                    </span>
                  </Label>
                  {tipo === 'textarea' ? (
                    <Textarea
                      id={`var-${key}`}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      required={isRequired}
                      className="mt-1 text-xs min-h-[60px]"
                    />
                  ) : (
                    <Input
                      id={`var-${key}`}
                      type={tipo === 'fecha' ? 'date' : tipo === 'numero' ? 'number' : 'text'}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      required={isRequired}
                      className="mt-1 text-sm"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <DialogFooter className="pt-3 border-t border-outline-variant/30">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Icon name="download" size={18} />
              {loading ? 'Generando...' : 'Generar y Descargar .docx'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
