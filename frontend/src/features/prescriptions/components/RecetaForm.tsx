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
  step: string
  min?: number
  max?: number
}

const OJO_CAMPOS: OjoCampo[] = [
  { nombre: 'esfera', label: 'Esfera', step: '0.25', min: -30, max: 30 },
  { nombre: 'cilindro', label: 'Cilindro', step: '0.25', min: -30, max: 30 },
  { nombre: 'eje', label: 'Eje', step: '1', min: 0, max: 180 },
  { nombre: 'adicion', label: 'Adición', step: '0.25', min: 0 },
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
    <div className="grid gap-4 sm:grid-cols-2">
      {OJO_CAMPOS.map((campo) => (
        <div key={campo.nombre} className="space-y-1.5">
          <Label htmlFor={`${lado}_${campo.nombre}`}>{campo.label}</Label>
          <Input
            id={`${lado}_${campo.nombre}`}
            type="number"
            inputMode="decimal"
            step={campo.step}
            min={campo.min}
            max={campo.max}
            placeholder="—"
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
      <form onSubmit={onSubmit} className="space-y-6">
        <SectionCard icon="person" title="Paciente">
          <div className="space-y-1.5">
            <Label htmlFor="nombre_paciente">Nombre del paciente</Label>
            <Input
              id="nombre_paciente"
              placeholder="Nombre completo del paciente"
              {...form.register('nombre_paciente')}
            />
            <FieldError message={form.formState.errors.nombre_paciente?.message} />
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon="visibility" title="OD — Ojo derecho">
            <OjoFields lado="od" />
          </SectionCard>
          <SectionCard icon="visibility_off" title="OI — Ojo izquierdo">
            <OjoFields lado="oi" />
          </SectionCard>
        </div>

        <SectionCard icon="straighten" title="Medidas y notas">
          <div className="space-y-1.5">
            <Label htmlFor="distancia_pupilar">Distancia pupilar (mm)</Label>
            <Input
              id="distancia_pupilar"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={100}
              placeholder="—"
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
              placeholder="Indicaciones, observaciones o recomendaciones..."
              {...form.register('notas')}
            />
            <FieldError message={form.formState.errors.notas?.message} />
          </div>
        </SectionCard>

        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/60 flex items-center justify-end gap-2">
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