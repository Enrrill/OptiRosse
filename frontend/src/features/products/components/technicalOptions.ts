import type { TipoProducto } from '@/types/models'

export const INDICES_REFRACCION = [
  { value: '1.499', label: '1.499 (CR-39 / Orgánico)' },
  { value: '1.56', label: '1.56 (Índice Medio)' },
  { value: '1.59', label: '1.59 (Policarbonato)' },
  { value: '1.60', label: '1.60 (Alto Índice MR-8)' },
  { value: '1.67', label: '1.67 (Alto Índice)' },
  { value: '1.74', label: '1.74 (Ultra Alto Índice)' },
]

export const MATERIALES_CRISTAL = [
  'CR-39 / Orgánico',
  'Policarbonato',
  'Trivex',
  'Alto Índice 1.67',
  'Alto Índice 1.74',
  'Mineral / Vidrio',
]

export const MATERIALES_MONTURA = [
  'Acetato',
  'Metal / Monel',
  'Titanio',
  'TR90 / Grilamid',
  'Madera',
  'Aluminio',
  'Combinado',
]

export const TRATAMIENTOS = [
  'Blanco / Sin Tratamiento',
  'Antirreflejo Estándar',
  'Antirreflejo Hidrófobo (Super AR)',
  'Filtro Luz Azul (Blue Cut)',
  'Fotocromático (Transitions)',
  'Fotocromático + Blue Cut',
  'Polarizado',
  'Espejado',
]

export const DISENOS_CRISTAL = [
  'Monofocal',
  'Bifocal Flattop',
  'Progresivo Digital',
  'Progresivo Estándar',
  'Ocupacional',
]

export const DISENOS_MONTURA = [
  'Rectangular',
  'Redondo',
  'Cat Eye',
  'Aviador',
  'Cuadrado',
  'Ovalado',
  'Wayfarer',
  'Geométrico',
]

export function getMaterialOptions(tipo: TipoProducto | undefined): string[] {
  if (tipo === 'montura') return MATERIALES_MONTURA
  if (tipo === 'cristal_terminado' || tipo === 'bloque_tallado') return MATERIALES_CRISTAL
  return [...MATERIALES_MONTURA, ...MATERIALES_CRISTAL]
}

export function getDisenoOptions(tipo: TipoProducto | undefined): string[] {
  if (tipo === 'montura') return DISENOS_MONTURA
  if (tipo === 'cristal_terminado' || tipo === 'bloque_tallado') return DISENOS_CRISTAL
  return [...DISENOS_MONTURA, ...DISENOS_CRISTAL]
}
