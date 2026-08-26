import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { DEFAULT_VARIANTE_ROW, type ProductoFormValues } from './productoSchema'

const COLS = [
  { label: 'SKU', name: 'sku', className: 'min-w-[130px]' },
  { label: 'Código de barras', name: 'codigo_barras', className: 'min-w-[130px]' },
  { label: 'Color', name: 'color', className: 'min-w-[110px]' },
  { label: 'Tamaño', name: 'tamano', className: 'min-w-[90px]' },
  { label: 'Esfera', name: 'esfera', className: 'min-w-[80px]' },
  { label: 'Cilindro', name: 'cilindro', className: 'min-w-[80px]' },
  { label: 'Eje', name: 'eje', className: 'min-w-[70px]' },
  { label: 'Adición', name: 'adicion', className: 'min-w-[80px]' },
  { label: 'Stock', name: 'stock', className: 'min-w-[80px]' },
  { label: 'Alerta mín.', name: 'alerta_stock_minimo', className: 'min-w-[90px]' },
  { label: 'Precio mayor', name: 'precio_al_mayor', className: 'min-w-[110px]' },
  { label: 'Precio costo', name: 'precio_costo', className: 'min-w-[110px]' },
] as const

type ColName = (typeof COLS)[number]['name']

const NULLABLE_COLS: ReadonlySet<string> = new Set(['esfera', 'cilindro', 'eje', 'adicion'])
const MONEY_COLS: ReadonlySet<string> = new Set(['precio_al_mayor', 'precio_costo'])

interface VarianteRowProps {
  index: number
  onRemove: () => void
}

function VarianteRow({ index, onRemove }: VarianteRowProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductoFormValues>()

  const errorAt = (name: ColName): string | undefined => {
    const err = errors.variantes?.[index]
    if (!err) return undefined
    const fieldError = (err as { [key: string]: { message?: string } | undefined })[name]
    return fieldError?.message
  }

  const registerInput = (name: ColName) => {
    const opts = {
      ...(NULLABLE_COLS.has(name)
        ? { setValueAs: (v: unknown) => (v === '' || v === null ? null : Number(v)) }
        : {}),
      ...(name === 'stock' || name === 'alerta_stock_minimo'
        ? { valueAsNumber: true }
        : {}),
      ...(MONEY_COLS.has(name) ? { valueAsNumber: true } : {}),
    }
    return register(`variantes.${index}.${name}`, opts)
  }

  return (
    <tr className="align-top hover:bg-surface-container-low">
      {COLS.map((col) => (
        <td key={col.name} className={cn('px-2 py-2', col.className)}>
          {MONEY_COLS.has(col.name) ? (
            <MoneyInput
              aria-label={col.label}
              inputMode="decimal"
              step="0.01"
              className={cn(errorAt(col.name as ColName) && 'border-error')}
              {...registerInput(col.name as ColName)}
            />
          ) : (
            <Input
              aria-label={col.label}
              className={cn(errorAt(col.name as ColName) && 'border-error')}
              {...registerInput(col.name as ColName)}
            />
          )}
          <FieldError message={errorAt(col.name as ColName)} className={cn('mt-1 text-[10px] leading-tight')} />
        </td>
      ))}
      <td className="px-2 py-2 align-middle">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Eliminar variante"
          className="text-error hover:bg-error-container/40 hover:text-error"
          onClick={onRemove}
        >
          <Icon name="delete" size={18} />
        </Button>
      </td>
    </tr>
  )
}

export function VariantesEditor() {
  const { control } = useFormContext<ProductoFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variantes',
  })

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-xs">
        <div className="overflow-x-auto p-0.5">
          <table className="w-full min-w-[1320px] text-sm">
            <thead>
              <tr className="border-b border-outline-variant/60 bg-surface-container-low/80">
                {COLS.map((col) => (
                  <th
                    key={col.name}
                    className={cn(
                      'px-2.5 py-3 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline select-none',
                      col.className,
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-2.5 py-3 text-left font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {fields.map((field, index) => (
                <VarianteRow key={field.id} index={index} onRemove={() => remove(index)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="inline-flex items-center gap-1.5"
        onClick={() => append(DEFAULT_VARIANTE_ROW())}
      >
        <Icon name="add" size={18} /> Agregar variante
      </Button>
    </div>
  )
}