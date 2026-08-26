export const PAGE_SIZE_OPTIONS = [5, 8, 10, 15, 25, 50]

export const DEFAULT_PAGE_SIZE_BY_SECTION: Record<string, number> = {
  clientes: 8,
  'inventario-categorias': 8,
  'inventario-productos': 8,
  'inventario-variantes': 8,
  recetas: 8,
  pedidos: 8,
  'finanzas-pagos': 8,
  'finanzas-libromayor': 8,
  'finanzas-metodos': 8,
  'documentos-empresa': 8,
  'documentos-sistema': 8,
  auditoria: 10,
  usuarios: 8,
}

export const FALLBACK_PAGE_SIZE = 8

const LOCAL_STORAGE_PREFIX = 'optirosse_page_size_'

/**
 * Obtiene el tamaño de página guardado en localStorage para una sección dada,
 * o retorna el valor predeterminado configurado si no existe.
 */
export function getStoredPageSize(storageKey?: string, overrideDefault?: number): number {
  const defaultSize = overrideDefault ?? (storageKey ? (DEFAULT_PAGE_SIZE_BY_SECTION[storageKey] ?? FALLBACK_PAGE_SIZE) : FALLBACK_PAGE_SIZE)

  if (!storageKey || typeof window === 'undefined') {
    return defaultSize
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${storageKey}`)
    if (raw) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        return parsed
      }
    }
  } catch {
    // Si localStorage falla (ej. incógnito con restricciones), se usa el valor por defecto
  }

  return defaultSize
}

/**
 * Guarda el tamaño de página para una sección en localStorage.
 */
export function setStoredPageSize(storageKey: string, size: number): void {
  if (!storageKey || typeof window === 'undefined') return

  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${storageKey}`, String(size))
  } catch {
    // Manejo silencioso en caso de restricciones de almacenamiento
  }
}
