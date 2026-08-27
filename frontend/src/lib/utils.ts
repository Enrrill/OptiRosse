import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function preventScientificNotationKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault()
  }
}

export function preventScientificNotationPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const pasteData = e.clipboardData.getData('text')
  if (/[eE+-]/.test(pasteData)) {
    e.preventDefault()
  }
}
