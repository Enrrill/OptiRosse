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
import { TIPO_PRODUCTO } from '@/lib/constants/choices'
import { useCrearCategoria, useActualizarCategoria } from '../hooks/useCategoriaMutations'
import {
  CATEGORIA_DEFAULT_VALUES,
  categoriaSchema,
  TIPOS_PRODUCTO,
  toCategoriaFormValues,
  type CategoriaFormValues,
} from './categoriaSchema'
import type { Categoria } from '@/types/models'

interface CategoriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria | null
}

export function CategoriaFormDialog({ open, onOpenChange, categoria }: CategoriaFormDialogProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria(categoria?.id ?? null)
  const esEdicion = categoria != null

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: categoria ? toCategoriaFormValues(categoria) : CATEGORIA_DEFAULT_VALUES,
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
            setError(field as keyof CategoriaFormValues, { message: msgs[0] })
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
          <DialogTitle>{esEdicion ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? `Actualiza ${categoria?.nombre ?? 'la categoría'}.`
              : 'Agrupa tus productos por tipo en el inventario.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoria-nombre">Nombre</Label>
            <Input
              id="categoria-nombre"
              placeholder="Monturas de diseño"
              {...register('nombre')}
            />
            <FieldError message={errors.nombre?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria-tipo">Tipo de producto</Label>
            <Controller
              control={control}
              name="tipo_producto"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoria-tipo">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PRODUCTO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {TIPO_PRODUCTO[tipo].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.tipo_producto?.message} />
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
              {esEdicion ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}