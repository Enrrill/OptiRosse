import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { SectionCard } from '@/components/forms/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { TIPO_DOCUMENTO } from '@/lib/constants/choices'
import { useCrearPlantilla, useActualizarPlantilla } from '../hooks/usePlantillaMutations'
import {
  PLANTILLA_DEFAULT_VALUES,
  plantillaSchema,
  toPlantillaFormValues,
  type PlantillaFormValues,
} from './plantillaSchema'
import type { PlantillaDocumento } from '@/types/models'

interface PlantillaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantilla?: PlantillaDocumento | null
}

const EDITOR_HEIGHT = '240px'

function EditorPanel({
  label,
  value,
  lang,
  error,
  onChange,
}: {
  label: string
  value: string
  lang?: 'html' | 'css'
  error?: boolean
  onChange: (value: string) => void
}) {
  const extension = lang === 'css' ? [css()] : [html()]
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        className={cn(
          'overflow-hidden rounded-xl border bg-surface-container-lowest transition-colors',
          error ? 'border-error/60' : 'border-outline-variant focus-within:border-primary',
        )}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extension}
          height={EDITOR_HEIGHT}
          className="text-sm"
        />
      </div>
    </div>
  )
}

export function PlantillaFormDialog({ open, onOpenChange, plantilla }: PlantillaFormDialogProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearPlantilla()
  const actualizar = useActualizarPlantilla(plantilla?.id ?? null)
  const esEdicion = plantilla != null

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<PlantillaFormValues>({
    resolver: zodResolver(plantillaSchema),
    defaultValues: plantilla ? toPlantillaFormValues(plantilla) : PLANTILLA_DEFAULT_VALUES,
  })

  const [contenidoHtml = '', estilosCss = ''] = useWatch({
    control,
    name: ['contenido_html', 'estilos_css'],
  })

  const hayContenido = Boolean(contenidoHtml.trim())
  const preview = `${estilosCss.trim() ? `<style>${estilosCss}</style>` : ''}${contenidoHtml}`

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (esEdicion) await actualizar.mutateAsync(values)
      else await crear.mutateAsync(values)
      onOpenChange(false)
      reset()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            setError(field as keyof PlantillaFormValues, { message: msgs[0] })
            mapped = true
          }
        }
        if (!mapped) toast.error(apiErr.defaultMessage)
      } else {
        toast.error(apiErr.defaultMessage)
      }
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="w-full max-w-5xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar plantilla' : 'Nueva plantilla'}</DialogTitle>
          <DialogDescription>
            Define el HTML y CSS que se usarán al generar documentos. Usa la sintaxis de plantillas
            Django, por ejemplo {'{{ pedido.cliente.nombre_comercial }}'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <SectionCard icon="description" title="Información">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plantilla-nombre">Nombre</Label>
                <Input
                  id="plantilla-nombre"
                  placeholder="Factura estándar"
                  {...register('nombre')}
                />
                <FieldError message={errors.nombre?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de documento</Label>
                <Controller
                  control={control}
                  name="tipo_documento"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={esEdicion}>
                      <SelectTrigger id="plantilla-tipo">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPO_DOCUMENTO).map(([value, display]) => (
                          <SelectItem key={value} value={value}>
                            {display.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {esEdicion && (
                  <p className="text-xs text-on-surface-variant">
                    El tipo de documento no se puede cambiar (una plantilla por tipo).
                  </p>
                )}
                <FieldError message={errors.tipo_documento?.message} />
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SectionCard icon="code" title="Contenido">
              <div className="space-y-4">
                <FieldError message={errors.contenido_html?.message} />
                <Controller
                  control={control}
                  name="contenido_html"
                  render={({ field }) => (
                    <EditorPanel
                      label="Contenido HTML"
                      value={field.value}
                      lang="html"
                      error={Boolean(errors.contenido_html?.message)}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="estilos_css"
                  render={({ field }) => (
                    <EditorPanel
                      label="Estilos CSS"
                      value={field.value}
                      lang="css"
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </SectionCard>

            <SectionCard icon="visibility" title="Vista previa">
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                {hayContenido ? (
                  <iframe
                    title="Vista previa de la plantilla"
                    srcDoc={preview}
                    sandbox=""
                    className="h-[560px] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-[560px] items-center justify-center text-sm text-on-surface-variant">
                    Escribe HTML para ver la vista previa.
                  </div>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">
                La vista previa es local: las variables {'{{ ... }}'} se muestran como texto y solo
                se resuelven al generar el documento.
              </p>
            </SectionCard>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" loading={submitting}>
              {!submitting && <Icon name="save" size={18} />}
              {esEdicion ? 'Guardar cambios' : 'Crear plantilla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}