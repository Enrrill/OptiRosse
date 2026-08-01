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
