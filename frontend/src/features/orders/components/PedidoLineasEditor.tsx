import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { formatMoney } from '@/lib/format'
import { buscarVariantes } from '../hooks/useOpciones'
import { totalLinea } from '../lib/pedidoTotales'
import {
  DEFAULT_PEDIDO_LINEA,
  type PedidoFormValues,
  type VarianteSeleccion,
} from './pedidoSchema'

interface PedidoLineaRowProps {
  index: number
  onRemove: () => void
}

interface LineaErrores {
  variante?: { message?: string }
  cantidad?: { message?: string }
  precio_unitario?: { message?: string }
}

function PedidoLineaRow({ index, onRemove }: PedidoLineaRowProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PedidoFormValues>()

  const linea = watch(`detalles.${index}`)
  const lineaErrores = errors.detalles?.[index] as LineaErrores | undefined
  const errorMessage = (name: keyof LineaErrores) => lineaErrores?.[name]?.message

  const handleSelectVariante = (variante: VarianteSeleccion | null) => {
    setValue(`detalles.${index}.variante`, variante, { shouldDirty: true, shouldValidate: true })
    if (variante?.precio_al_mayor != null) {
      setValue(`detalles.${index}.precio_unitario`, Number(variante.precio_al_mayor), {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  return (
    <tr className="align-top hover:bg-surface-container-low">
      <td className="min-w-[240px] px-2 py-2">
        <SearchableSelect<VarianteSeleccion>
          keyId={`variante-${index}`}
          value={linea.variante}
          onChange={handleSelectVariante}
          searchOptions={buscarVariantes}
          formatSelected={(v) => v.sku}
          placeholder="Buscar variante (SKU, marca, modelo)..."
        />
        <FieldError message={errorMessage('variante')} className="mt-1 text-[10px] leading-tight" />
      </td>
      <td className="w-24 px-2 py-2">
        <Input
          aria-label="Cantidad"
          type="number"
          min={1}
          inputMode="numeric"
          className={cn(errorMessage('cantidad') && 'border-error')}
          {...register(`detalles.${index}.cantidad`, { valueAsNumber: true })}
        />
        <FieldError message={errorMessage('cantidad')} className="mt-1 text-[10px] leading-tight" />
      </td>
      <td className="w-36 px-2 py-2">
        <MoneyInput
          aria-label="Precio unitario"
          inputMode="decimal"
          step="0.01"
          className={cn(errorMessage('precio_unitario') && 'border-error')}
          {...register(`detalles.${index}.precio_unitario`, { valueAsNumber: true })}
        />
        <FieldError
          message={errorMessage('precio_unitario')}
          className="mt-1 text-[10px] leading-tight"
        />
      </td>
      <td className="w-32 px-2 py-2 text-right">
        <span className="font-medium text-on-surface">{formatMoney(totalLinea(linea))}</span>
      </td>
      <td className="w-12 px-2 py-2 align-middle">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Quitar línea"
          className="text-error hover:bg-error-container/40 hover:text-error"
          onClick={onRemove}
        >
          <Icon name="delete" size={18} />
        </Button>
      </td>
    </tr>
  )
}

export function PedidoLineasEditor() {
  const { control } = useFormContext<PedidoFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalles',
  })

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="min-w-[240px] px-2 py-2.5 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Variante
              </th>
              <th className="w-24 px-2 py-2.5 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Cantidad
              </th>
              <th className="w-36 px-2 py-2.5 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Precio unitario
              </th>
              <th className="w-32 px-2 py-2.5 text-right font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Total línea
              </th>
              <th className="w-12 px-2 py-2.5 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {fields.map((field, index) => (
              <PedidoLineaRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        onClick={() => append(DEFAULT_PEDIDO_LINEA())}
      >
        <Icon name="add" size={18} /> Agregar línea
      </Button>
    </div>
  )
}