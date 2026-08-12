import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategorias } from '../hooks/useCategorias'
import { useCrearProducto, useActualizarProducto } from '../hooks/useProductoMutations'
import {
  productoSchema,
  PRODUCTO_DEFAULT_VALUES,
  toProductoFormValues,
  toProductoPayload,
  type ProductoFormValues,
} from './productoSchema'
import { VariantesEditor } from './VariantesEditor'
import type { Producto } from '@/types/models'

interface ProductoFormProps {
  producto?: Producto | null
  onSuccess: () => void
  onCancel?: () => void
}

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto(producto?.id ?? null)
  const esEdicion = producto != null

  const categorias = useCategorias()

  const methods = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? toProductoFormValues(producto) : PRODUCTO_DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = methods

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const payload = toProductoPayload(values)
      if (esEdicion) await actualizar.mutateAsync(payload)
      else await crear.mutateAsync(payload)
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          const message = msgs?.[0]
          if (typeof message === 'string') {
            setError(field as keyof ProductoFormValues, { message })
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
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-6">
        <SectionCard icon="inventory_2" title="Datos del producto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" placeholder="OptiLook" {...register('marca')} />
              <FieldError message={errors.marca?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="codigo_modelo">Código / modelo</Label>
              <Input id="codigo_modelo" placeholder="MT-2201" {...register('codigo_modelo')} />
              <FieldError message={errors.codigo_modelo?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={String(categoria.id)}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.categoria?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                rows={2}
                placeholder="Descripción general del producto..."
                {...register('descripcion')}
              />
              <FieldError message={errors.descripcion?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="tune" title="Opciones técnicas">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="indice_refraccion">Índice de refracción</Label>
              <Input id="indice_refraccion" placeholder="1.67" {...register('indice_refraccion')} />
              <FieldError message={errors.indice_refraccion?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material">Material</Label>
              <Input id="material" placeholder="Policarbonato" {...register('material')} />
              <FieldError message={errors.material?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tratamiento">Tratamiento</Label>
              <Input id="tratamiento" placeholder="Antirreflejo" {...register('tratamiento')} />
              <FieldError message={errors.tratamiento?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diseno">Diseño</Label>
              <Input id="diseno" placeholder="Rectangular" {...register('diseno')} />
              <FieldError message={errors.diseno?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="barcode_scanner" title="Variantes">
          <VariantesEditor />
          <p className="text-xs text-on-surface-variant">
            Al guardar, las variantes eliminadas se desactivan automáticamente.
          </p>
        </SectionCard>

        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/60 flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {!submitting && <Icon name="save" size={18} className="mr-1.5" />}
            {esEdicion ? 'Guardar producto' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}