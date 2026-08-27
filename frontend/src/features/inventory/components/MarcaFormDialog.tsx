import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCrearMarca, useActualizarMarca } from '../hooks/useMarcaMutations'
import { marcaSchema, type MarcaPayload } from './marcaSchema'
import type { Marca } from '@/types/models'

interface MarcaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marca?: Marca | null
}

export function MarcaFormDialog({ open, onOpenChange, marca }: MarcaFormDialogProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearMarca()
  const actualizar = useActualizarMarca(marca?.id ?? null)
  const esEdicion = marca != null

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<MarcaPayload>({
    resolver: zodResolver(marcaSchema),
    defaultValues: { nombre: marca?.nombre ?? '' },
  })

  useEffect(() => {
    reset({ nombre: marca?.nombre ?? '' })
  }, [marca, open, reset])

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
            setError(field as keyof MarcaPayload, { message: msgs[0] })
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
          <DialogTitle>{esEdicion ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
          <DialogDescription>
            {esEdicion ? `Actualiza ${marca?.nombre ?? 'la marca'}.` : 'Registra marcas para reutilizarlas en tus productos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="marca-nombre">Nombre de la marca</Label>
            <Input id="marca-nombre" placeholder="Ej: Ray-Ban, Oakley, OptiLook" {...register('nombre')} />
            <FieldError message={errors.nombre?.message} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {!submitting && <Icon name="save" size={18} />}
              {esEdicion ? 'Guardar cambios' : 'Crear marca'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
