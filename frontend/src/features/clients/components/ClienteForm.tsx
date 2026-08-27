import { useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { SectionCard } from '@/components/forms/SectionCard'
import { FieldError } from '@/components/forms/FieldError'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCrearCliente, useActualizarCliente } from '../hooks/useClienteMutations'
import {
  clienteSchema,
  CLIENTE_DEFAULT_VALUES,
  toClienteFormValues,
  toClientePayload,
  type ClienteFormValues,
} from './clienteSchema'
import type { Cliente } from '@/types/models'

interface ClienteFormProps {
  cliente?: Cliente | null
  onSuccess: () => void
  onCancel?: () => void
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearCliente()
  const actualizar = useActualizarCliente(cliente?.id ?? null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? toClienteFormValues(cliente) : CLIENTE_DEFAULT_VALUES,
  })

  // Observa el límite en tiempo real para habilitar/deshabilitar días de crédito
  const limiteActual = useWatch({ control, name: 'limite_credito' })
  const sinLimite = limiteActual === null

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (cliente) await actualizar.mutateAsync(toClientePayload(values))
      else await crear.mutateAsync(toClientePayload(values))
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            setError(field as keyof ClienteFormValues, { message: msgs[0] })
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
    <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <SectionCard icon="badge" title="Identificación">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="razon_social">Razón social</Label>
              <Input id="razon_social" placeholder="OptiRosse C.A." {...register('razon_social')} />
              <FieldError message={errors.razon_social?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre_comercial">Nombre comercial</Label>
              <Input id="nombre_comercial" placeholder="OptiRosse" {...register('nombre_comercial')} />
              <FieldError message={errors.nombre_comercial?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="identificacion_fiscal">Identificación fiscal (RIF)</Label>
              <Input
                id="identificacion_fiscal"
                placeholder="J-00000000-0"
                {...register('identificacion_fiscal')}
              />
              <FieldError message={errors.identificacion_fiscal?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="contact_mail" title="Contacto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="contacto@empresa.com"
                {...register('correo')}
              />
              <FieldError message={errors.correo?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="+58 000 000 0000" {...register('telefono')} />
              <FieldError message={errors.telefono?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="direccion">
                Dirección
                <span className="ml-1.5 text-xs font-normal text-on-surface-variant">(Opcional)</span>
              </Label>
              <Textarea
                id="direccion"
                rows={3}
                className="min-h-[80px] max-h-40 resize-y"
                placeholder="Av. Principal, Edificio Centro, Piso 2..."
                {...register('direccion')}
              />
              <FieldError message={errors.direccion?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="credit_card" title="Crédito">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="limite_credito">Límite de crédito</Label>
              <Controller
                name="limite_credito"
                control={control}
                render={({ field }) => (
                  <MoneyInput
                    id="limite_credito"
                    step="0.01"
                    placeholder="Sin límite"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      field.onChange(raw === '' ? null : parseFloat(raw))
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError message={errors.limite_credito?.message} />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="dias_credito"
                className={sinLimite ? 'text-on-surface-variant/50' : undefined}
              >
                Días de crédito
              </Label>
              <Controller
                name="dias_credito"
                control={control}
                render={({ field }) => (
                  <Input
                    id="dias_credito"
                    type="number"
                    min={0}
                    step={1}
                    disabled={sinLimite}
                    placeholder={sinLimite ? 'Requiere límite' : 'Sin plazo'}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value
                      field.onChange(raw === '' ? null : parseInt(raw, 10))
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError message={errors.dias_credito?.message} />
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
          Guardar cliente
        </Button>
      </div>
    </form>
  )
}
