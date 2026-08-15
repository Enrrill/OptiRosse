import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCrearMetodoPago, useActualizarMetodoPago } from '../hooks/useMetodoPagoMutations'
import {
  METODO_PAGO_DEFAULT_VALUES,
  MONEDAS,
  metodoPagoSchema,
  toMetodoPagoFormValues,
  type MetodoPagoFormValues,
} from './metodoPagoSchema'
import type { MetodoPago } from '@/types/models'

interface MetodoPagoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metodo?: MetodoPago | null
}

export function MetodoPagoFormDialog({ open, onOpenChange, metodo }: MetodoPagoFormDialogProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearMetodoPago()
  const actualizar = useActualizarMetodoPago(metodo?.id ?? null)
  const esEdicion = metodo != null

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<MetodoPagoFormValues>({
    resolver: zodResolver(metodoPagoSchema),
    defaultValues: metodo ? toMetodoPagoFormValues(metodo) : METODO_PAGO_DEFAULT_VALUES,
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (esEdicion) await actualizar.mutateAsync(values)
      else await crear.mutateAsync(values)
      onOpenChange(false)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            setError(field as keyof MetodoPagoFormValues, { message: msgs[0] })
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
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar método de pago' : 'Nuevo método de pago'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? `Actualiza ${metodo?.nombre ?? 'el método de pago'}.`
              : 'Define cómo recibirán los pagos tus clientes.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="metodo-nombre">Nombre</Label>
            <Input
              id="metodo-nombre"
              placeholder="Transferencia bancaria"
              {...register('nombre')}
            />
            <FieldError message={errors.nombre?.message} />
          </div>

          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Controller
              control={control}
              name="moneda"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="metodo-moneda">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((moneda) => (
                      <SelectItem key={moneda} value={moneda}>
                        {moneda}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.moneda?.message} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
            <div>
              <Label htmlFor="metodo-referencia" className="font-medium">
                Requiere número de referencia
              </Label>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Los pagos con este método deben incluir una referencia para aprobarse.
              </p>
            </div>
            <Controller
              control={control}
              name="requiere_referencia"
              render={({ field }) => (
                <Switch
                  id="metodo-referencia"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {!submitting && <Icon name="save" size={18} />}
              {esEdicion ? 'Guardar cambios' : 'Crear método'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}