import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { SectionCard } from '@/components/forms/SectionCard'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import type { Pedido } from '@/types/models'
import { buscarClientes } from '@/lib/api/opciones'
import { buscarRecetas } from '../hooks/useOpciones'
import { useActualizarPedido, useCrearPedido } from '../hooks/usePedidoMutations'
import { calcularTotalesLineas } from '../lib/pedidoTotales'
import { PedidoLineasEditor } from './PedidoLineasEditor'
import { PedidoTotalesPanel } from './PedidoTotalesPanel'
import {
  PEDIDO_DEFAULT_VALUES,
  pedidoFormSchema,
  toPedidoFormValues,
  toPedidoPayload,
  type ClienteSeleccion,
  type PedidoFormValues,
  type RecetaSeleccion,
} from './pedidoSchema'

interface PedidoFormProps {
  pedido?: Pedido | null
  preselectCliente?: ClienteSeleccion | null
  onSuccess: (pedido: Pedido) => void
  onCancel: () => void
}

const CAMPOS_SERVIDOR = ['cliente', 'receta', 'detalles']

export function PedidoForm({ pedido, preselectCliente, onSuccess, onCancel }: PedidoFormProps) {
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoFormSchema),
    defaultValues: pedido
      ? toPedidoFormValues(pedido)
      : preselectCliente
        ? { ...PEDIDO_DEFAULT_VALUES, cliente: preselectCliente }
        : PEDIDO_DEFAULT_VALUES,
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <FormCuerpo pedido={pedido} onSuccess={onSuccess} onCancel={onCancel} />
    </FormProvider>
  )
}

function FormCuerpo({
  pedido,
  onSuccess,
  onCancel,
}: Omit<PedidoFormProps, 'preselectCliente'>) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState,
  } = useFormContext<PedidoFormValues>()
  const errors = formState.errors
  const cliente = watch('cliente')
  const receta = watch('receta')
  const detalles = watch('detalles')
  const totales = calcularTotalesLineas(detalles)

  const crear = useCrearPedido()
  const actualizar = useActualizarPedido(pedido?.id ?? null)
  const mutation = pedido ? actualizar : crear
  const toast = useToast()

  const mapearErrores = (apiError: ApiError) => {
    const errores = apiError.errors
    if (!errores || Array.isArray(errores)) {
      toast.error(apiError.defaultMessage)
      return
    }

    if (errores.cliente) {
      setError('cliente', { type: 'server', message: errores.cliente[0] })
    }
    if (errores.receta) {
      setError('receta', { type: 'server', message: errores.receta[0] })
    }

    const lineas = errores.detalles
    if (Array.isArray(lineas)) {
      lineas.forEach((linea, i) => {
        if (!linea || typeof linea !== 'object') return
        const porCampo = linea as Record<string, string[] | undefined>
        for (const campo of Object.keys(porCampo)) {
          const mensaje = porCampo[campo]?.[0]
          if (mensaje) {
            setError(`detalles.${i}.${campo}` as never, { type: 'server', message: mensaje })
          }
        }
      })
    } else if (lineas) {
      toast.error((lineas as string[]).flat().join(' '))
    }

    const resto = Object.entries(errores).filter(([campo]) => !CAMPOS_SERVIDOR.includes(campo))
    if (resto.length > 0) {
      const mensajes = resto
        .map(([, mensajes]) => (mensajes as string[])?.[0])
        .filter(Boolean)
      if (mensajes.length > 0) toast.error(mensajes.join(' '))
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const respuesta = await mutation.mutateAsync(toPedidoPayload(values))
      onSuccess(respuesta.data)
    } catch (err) {
      if (err instanceof ApiError) mapearErrores(err)
      else toast.error('No se pudo guardar el pedido')
    }
  })

  const errorLineas = (errors.detalles as { message?: string } | undefined)?.message

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-6">
        <SectionCard icon="person" title="Cliente y receta">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <SearchableSelect<ClienteSeleccion>
                keyId="cliente"
                value={cliente}
                onChange={(value) =>
                  setValue('cliente', value, { shouldDirty: true, shouldValidate: true })
                }
                searchOptions={buscarClientes}
                formatSelected={(c) => c.nombre_comercial}
                placeholder="Buscar cliente por nombre o RIF..."
              />
              <FieldError message={errors.cliente?.message} />
            </div>
            <div className="space-y-2">
              <Label>Receta óptica (opcional)</Label>
              <SearchableSelect<RecetaSeleccion>
                keyId="receta"
                value={receta}
                onChange={(value) => setValue('receta', value, { shouldDirty: true })}
                searchOptions={buscarRecetas}
                formatSelected={(r) => r.nombre_paciente}
                placeholder="Buscar receta por paciente..."
              />
              <FieldError message={errors.receta?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="list_alt" title="Líneas del pedido">
          <PedidoLineasEditor />
          {errorLineas && <FieldError message={errorLineas} />}
          <p className="text-xs text-on-surface-variant">
            Al editar, las líneas eliminadas se descartan del pedido al guardar.
          </p>
        </SectionCard>

        <SectionCard icon="notes" title="Notas">
          <Textarea {...register('notas')} placeholder="Notas internas del pedido..." rows={3} />
        </SectionCard>

        <PedidoTotalesPanel
          subtotal={totales.subtotal}
          impuesto={totales.impuesto}
          total={totales.total}
          note="Los totales se recalculan al guardar."
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-outline-variant bg-surface-container-lowest/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Icon name="progress_activity" className="mr-2 animate-spin" />}
            {pedido ? 'Guardar cambios' : 'Crear pedido'}
          </Button>
        </div>
      </div>
    </form>
  )
}