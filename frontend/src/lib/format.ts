import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const MONEY_FORMATTER = new Intl.NumberFormat('es-VE', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return '—'
  return MONEY_FORMATTER.format(num)
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('es-VE')
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  return dayjs(value).format('DD/MM/YYYY')
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  return dayjs(value).format('DD/MM/YYYY hh:mm a')
}

export function formatHora(value?: string | null): string {
  if (!value) return '—'
  return dayjs(value).format('hh:mm a')
}

export function formatGradiente(esfera?: string | null): string {
  if (!esfera) return '—'
  return `${esfera}D`
}

export type NivelStock = 'empty' | 'low' | 'ok'

export function nivelStock(stock: number, alertaMinima: number): NivelStock {
  if (stock <= 0) return 'empty'
  if (stock <= alertaMinima) return 'low'
  return 'ok'
}

function valorGraduacion(valor?: string | number | null): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const num = typeof valor === 'string' ? Number(valor) : valor
  if (Number.isNaN(num)) return null
  return num
}

/** Resumen de graduación óptica, ej. "−2.5 / −0.75 / 180°" (o "—" si no hay valores). */
export function formatGradienteCompleto(
  esfera?: string | number | null,
  cilindro?: string | number | null,
  eje?: string | number | null,
): string {
  const partes: string[] = []
  const esferaN = valorGraduacion(esfera)
  const cilindroN = valorGraduacion(cilindro)
  const ejeN = valorGraduacion(eje)
  if (esferaN !== null) partes.push(String(esferaN))
  if (cilindroN !== null) partes.push(String(cilindroN))
  if (ejeN !== null) partes.push(`${ejeN}°`)
  if (partes.length === 0) return '—'
  return partes.join(' / ')
}
