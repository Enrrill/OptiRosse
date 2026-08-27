import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn, preventScientificNotationKeys, preventScientificNotationPaste } from '@/lib/utils'

/**
 * Input numérico para valores monetarios.
 * - Bloquea letras e/E, símbolos +/- en teclado y portapapeles
 * - [&::-webkit-*] oculta los spin buttons del navegador
 * - inputMode="decimal" activa el teclado numérico en móvil
 */
function MoneyInput({ className, onKeyDown, onPaste, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
        $
      </span>
      <Input
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        onKeyDown={(e) => {
          preventScientificNotationKeys(e)
          onKeyDown?.(e)
        }}
        onPaste={(e) => {
          preventScientificNotationPaste(e)
          onPaste?.(e)
        }}
        className={cn(
          'pl-7',
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&]:[-moz-appearance:textfield]',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export { MoneyInput }
