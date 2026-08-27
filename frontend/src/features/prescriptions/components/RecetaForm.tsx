import { useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { SectionCard } from '@/components/forms/SectionCard'
import { FieldError } from '@/components/forms/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCrearReceta, useActualizarReceta } from '../hooks/useRecetaMutations'
import {
  recetaSchema,
  RECETA_DEFAULT_VALUES,
  toRecetaFormValues,
  toRecetaPayload,
  type RecetaFormValues,
} from './recetaSchema'
import type { RecetaOptica } from '@/types/models'

interface RecetaFormProps {
  receta?: RecetaOptica | null
  onSuccess: () => void
  onCancel?: () => void
}

type Lado = 'od' | 'oi'

interface OjoCampo {
  nombre: 'esfera' | 'cilindro' | 'eje' | 'adicion'
  label: string
  sublabel: string
  step: string
  placeholder: string
  min?: number
  max?: number
}

const OJO_CAMPOS: OjoCampo[] = [
  { nombre: 'esfera', label: 'Esfera', sublabel: 'SPH', step: '0.25', placeholder: '0.00', min: -30, max: 30 },
  { nombre: 'cilindro', label: 'Cilindro', sublabel: 'CYL', step: '0.25', placeholder: '0.00', min: -30, max: 30 },
  { nombre: 'eje', label: 'Eje', sublabel: 'AXIS', step: '1', placeholder: '180°', min: 0, max: 180 },
  { nombre: 'adicion', label: 'Adición', sublabel: 'ADD', step: '0.25', placeholder: '+0.00', min: 0 },
]

function numeroOpcional(value: unknown): number | null {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

function OjoFields({ lado }: { lado: Lado }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RecetaFormValues>()

  const errorAt = (campo: OjoCampo['nombre']): string | undefined =>
    (errors as Record<string, { message?: string } | undefined>)[`${lado}_${campo}`]?.message

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {OJO_CAMPOS.map((campo) => (
        <div key={campo.nombre} className="flex flex-col justify-end gap-1.5">
          <Label
            htmlFor={`${lado}_${campo.nombre}`}
            className="flex items-center gap-1 min-h-[1.5rem]"
          >
            <span>{campo.label}</span>
            <span className="text-[10px] font-mono text-outline font-semibold">({campo.sublabel})</span>
          </Label>
          <Input
            id={`${lado}_${campo.nombre}`}
            type="number"
            inputMode="decimal"
            step={campo.step}
            min={campo.min}
            max={campo.max}
            placeholder={campo.placeholder}
            className={cn(errorAt(campo.nombre) && 'border-error')}
            {...register(`${lado}_${campo.nombre}`, { setValueAs: numeroOpcional })}
          />
          <FieldError message={errorAt(campo.nombre)} />
        </div>
      ))}
    </div>
  )
}

export function RecetaForm({ receta, onSuccess, onCancel }: RecetaFormProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearReceta()
  const actualizar = useActualizarReceta(receta?.id ?? null)

  const form = useForm<RecetaFormValues>({
    resolver: zodResolver(recetaSchema),
    defaultValues: receta ? toRecetaFormValues(receta) : RECETA_DEFAULT_VALUES,
  })

  const copiarOdAOi = () => {
    const values = form.getValues()
    form.setValue('oi_esfera', values.od_esfera, { shouldDirty: true, shouldValidate: true })
    form.setValue('oi_cilindro', values.od_cilindro, { shouldDirty: true, shouldValidate: true })
    form.setValue('oi_eje', values.od_eje, { shouldDirty: true, shouldValidate: true })
    form.setValue('oi_adicion', values.od_adicion, { shouldDirty: true, shouldValidate: true })
    toast.success('Valores de OD copiados a OI')
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (receta) await actualizar.mutateAsync(toRecetaPayload(values))
      else await crear.mutateAsync(toRecetaPayload(values))
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            form.setError(field as keyof RecetaFormValues, { message: msgs[0] })
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
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SectionCard icon="person" title="Paciente">
            <div className="space-y-1.5">
              <Label htmlFor="nombre_paciente">
                Nombre del paciente <span className="text-error">*</span>
              </Label>
              <Input
                id="nombre_paciente"
                placeholder="Nombre completo del paciente"
                {...form.register('nombre_paciente')}
              />
              <FieldError message={form.formState.errors.nombre_paciente?.message} />
            </div>
          </SectionCard>

          <div className="space-y-4">
            {/* Ojo Derecho Card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary border-b border-primary/10 pb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container text-xs font-mono font-bold tracking-wider">
                  OD
                </span>
                <Icon name="visibility" size={20} />
                <h4 className="font-semibold text-sm">Ojo Derecho (OD)</h4>
              </div>
              <OjoFields lado="od" />
            </div>

            {/* Ojo Izquierdo Card */}
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-secondary/10 pb-2.5">
                <div className="flex items-center gap-2.5 text-secondary">
                  <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-xs font-mono font-bold tracking-wider">
                    OI
                  </span>
                  <Icon name="visibility" size={20} />
                  <h4 className="font-semibold text-sm">Ojo Izquierdo (OI)</h4>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copiarOdAOi}
                  className="h-7 text-xs px-2.5 border-secondary/30 text-secondary hover:bg-secondary/10"
                >
                  <Icon name="content_copy" size={14} className="mr-1" /> Copiar OD
                </Button>
              </div>
              <OjoFields lado="oi" />
            </div>
          </div>

          <SectionCard icon="straighten" title="Medidas y notas">
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-1.5">
                <Label htmlFor="distancia_pupilar">Distancia pupilar (mm)</Label>
                <Input
                  id="distancia_pupilar"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  max={100}
                  placeholder="Ej: 64.0"
                  className={cn(form.formState.errors.distancia_pupilar && 'border-error')}
                  {...form.register('distancia_pupilar', { setValueAs: numeroOpcional })}
                />
                <FieldError message={form.formState.errors.distancia_pupilar?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  rows={3}
                  className="min-h-[80px] max-h-48 resize-y"
                  placeholder="Indicaciones, observaciones o recomendaciones..."
                  {...form.register('notas')}
                />
                <FieldError message={form.formState.errors.notas?.message} />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="flex-none border-t border-outline-variant/60 bg-surface-container-lowest px-6 py-4 flex items-center justify-end gap-3 z-10">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {!submitting && <Icon name="save" size={18} className="mr-1.5" />}
            Guardar receta
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}