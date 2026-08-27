import { useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
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
import { useMarcas } from '../hooks/useMarcas'
import { useCrearProducto, useActualizarProducto } from '../hooks/useProductoMutations'
import {
  productoSchema,
  PRODUCTO_DEFAULT_VALUES,
  toProductoFormValues,
  toProductoPayload,
  type ProductoFormValues,
} from './productoSchema'
import { VariantesEditor } from './VariantesEditor'
import { MarcaFormDialog } from './MarcaFormDialog'
import {
  INDICES_REFRACCION,
  MATERIALES_CRISTAL,
  MATERIALES_MONTURA,
  TRATAMIENTOS,
  DISENOS_CRISTAL,
  DISENOS_MONTURA,
} from './technicalOptions'
import type { Producto } from '@/types/models'

interface ProductoFormProps {
  producto?: Producto | null
  onSuccess: () => void
  onCancel?: () => void
}

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [nuevaMarcaModalOpen, setNuevaMarcaModalOpen] = useState(false)

  const crear = useCrearProducto()
  const actualizar = useActualizarProducto(producto?.id ?? null)
  const esEdicion = producto != null

  const categorias = useCategorias()
  const marcas = useMarcas()

  const methods = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? toProductoFormValues(producto) : PRODUCTO_DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = methods

  const categoriaId = useWatch({ control, name: 'categoria' })
  const catSeleccionada = categorias.categorias.find((c) => c.id === categoriaId)
  const tipoProducto = catSeleccionada?.tipo_producto

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

  const handleSugerirCodigo = () => {
    const prefijo =
      tipoProducto === 'montura'
        ? 'MON'
        : tipoProducto === 'cristal_terminado' || tipoProducto === 'bloque_tallado'
          ? 'CRI'
          : 'ACC'
    const aleatorio = Math.floor(Math.random() * 9000 + 1000)
    setValue('codigo_modelo', `${prefijo}-${aleatorio}`, { shouldValidate: true, shouldDirty: true })
  }

  const esCristal = tipoProducto === 'cristal_terminado' || tipoProducto === 'bloque_tallado'
  const esMontura = tipoProducto === 'montura'
  const mostrarOpcionesTecnicas = tipoProducto !== 'accesorio'

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <SectionCard icon="inventory_2" title="Datos del producto">
            <div className="grid gap-4 sm:grid-cols-2">
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
                        <SelectValue placeholder="Selecciona una categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.categorias.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre} ({cat.tipo_producto_display})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.categoria?.message} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marca">Marca</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1 text-xs text-primary hover:bg-transparent hover:underline"
                    onClick={() => setNuevaMarcaModalOpen(true)}
                  >
                    <Icon name="add" size={14} className="mr-0.5" /> Nueva marca
                  </Button>
                </div>
                <Controller
                  control={control}
                  name="marca"
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger id="marca">
                        <SelectValue placeholder="Selecciona una marca..." />
                      </SelectTrigger>
                      <SelectContent>
                        {marcas.marcas.map((m) => (
                          <SelectItem key={m.id} value={m.nombre}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.marca?.message} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="codigo_modelo">Código / Modelo</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1 text-xs text-on-surface-variant hover:text-primary hover:bg-transparent"
                    onClick={handleSugerirCodigo}
                  >
                    <Icon name="auto_fix_high" size={14} className="mr-0.5" /> Sugerir código
                  </Button>
                </div>
                <Input id="codigo_modelo" placeholder="Ej: MT-2201" {...register('codigo_modelo')} />
                <FieldError message={errors.codigo_modelo?.message} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  rows={2}
                  className="min-h-[70px] max-h-48 resize-y"
                  placeholder="Descripción general del producto o especificaciones adicionales..."
                  {...register('descripcion')}
                />
                <FieldError message={errors.descripcion?.message} />
              </div>
            </div>
          </SectionCard>

          {mostrarOpcionesTecnicas && (
            <SectionCard icon="tune" title="Opciones técnicas">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {esCristal && (
                  <div className="space-y-1.5">
                    <Label htmlFor="indice_refraccion">Índice de refracción</Label>
                    <Controller
                      control={control}
                      name="indice_refraccion"
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger id="indice_refraccion">
                            <SelectValue placeholder="Selecciona índice..." />
                          </SelectTrigger>
                          <SelectContent>
                            {INDICES_REFRACCION.map((idx) => (
                              <SelectItem key={idx.value} value={idx.value}>
                                {idx.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.indice_refraccion?.message} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="material">Material</Label>
                  <Controller
                    control={control}
                    name="material"
                    render={({ field }) => {
                      const options = esMontura
                        ? MATERIALES_MONTURA
                        : esCristal
                          ? MATERIALES_CRISTAL
                          : [...MATERIALES_MONTURA, ...MATERIALES_CRISTAL]
                      return (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger id="material">
                            <SelectValue placeholder="Selecciona material..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((mat) => (
                              <SelectItem key={mat} value={mat}>
                                {mat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  <FieldError message={errors.material?.message} />
                </div>

                {esCristal && (
                  <div className="space-y-1.5">
                    <Label htmlFor="tratamiento">Tratamiento</Label>
                    <Controller
                      control={control}
                      name="tratamiento"
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger id="tratamiento">
                            <SelectValue placeholder="Selecciona tratamiento..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TRATAMIENTOS.map((trat) => (
                              <SelectItem key={trat} value={trat}>
                                {trat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.tratamiento?.message} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="diseno">Diseño</Label>
                  <Controller
                    control={control}
                    name="diseno"
                    render={({ field }) => {
                      const options = esMontura
                        ? DISENOS_MONTURA
                        : esCristal
                          ? DISENOS_CRISTAL
                          : [...DISENOS_MONTURA, ...DISENOS_CRISTAL]
                      return (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger id="diseno">
                            <SelectValue placeholder="Selecciona diseño..." />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((dis) => (
                              <SelectItem key={dis} value={dis}>
                                {dis}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  <FieldError message={errors.diseno?.message} />
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard icon="barcode_scanner" title="Variantes del producto">
            <VariantesEditor tipoProducto={tipoProducto} />
            <p className="text-xs text-on-surface-variant/80 mt-2">
              Al guardar el producto, las variantes que elimines se desactivan automáticamente en la base de datos.
            </p>
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
            {esEdicion ? 'Guardar producto' : 'Crear producto'}
          </Button>
        </div>

        <MarcaFormDialog
          open={nuevaMarcaModalOpen}
          onOpenChange={setNuevaMarcaModalOpen}
        />
      </form>
    </FormProvider>
  )
}