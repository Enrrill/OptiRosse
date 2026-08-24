const SPECIAL_UPPER = new Set(['C.A.', 'S.A.', 'S.R.L.', 'S.A.S.', 'LLC', 'INC', 'CA', 'SA', 'SRL', 'RIF', 'B2B'])
const SPECIAL_LOWER = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'a', 'por', 'para', 'con'])

/**
 * Normaliza y formatea una dirección de correo a minúsculas y sin espacios.
 */
export function formatEmail(email?: string | null): string {
  if (!email) return '—'
  return email.trim().toLowerCase()
}

/**
 * Formatea nombres de personas, razones sociales y marcas con capitalización uniforme (Title Case),
 * preservando conectores ('de', 'la', 'del') y siglas ('C.A.', 'S.A.').
 */
export function formatName(name?: string | null): string {
  if (!name) return '—'
  const cleaned = name.replace(/\s+/g, ' ').trim()
  if (!cleaned) return '—'

  const words = cleaned.split(' ')
  const formatted = words.map((word, i) => {
    const wordLower = word.toLowerCase()
    const wordClean = wordLower.replace(/[.,]/g, '')

    if (SPECIAL_UPPER.has(word.toUpperCase()) || SPECIAL_UPPER.has(wordClean.toUpperCase())) {
      if (wordClean === 'ca' || wordClean === 'c.a.') return 'C.A.'
      if (wordClean === 'sa' || wordClean === 's.a.') return 'S.A.'
      if (wordClean === 'srl' || wordClean === 's.r.l.') return 'S.R.L.'
      return word.toUpperCase()
    }

    if (i > 0 && SPECIAL_LOWER.has(wordLower)) {
      return wordLower
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return formatted.join(' ')
}

/**
 * Formatea RIF venezolano al estándar J-12345678-9 o V-12345678-0.
 */
export function formatRIF(rif?: string | null): string {
  if (!rif) return '—'
  const raw = rif.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (!raw) return '—'

  const match = raw.match(/^([JVEGP])(\d{7,9})(\d)$/)
  if (match) {
    const [, prefix, digits, dv] = match
    return `${prefix}-${digits}-${dv}`
  }

  const matchDigits = raw.match(/^(\d{7,9})(\d)$/)
  if (matchDigits) {
    const [, digits, dv] = matchDigits
    return `V-${digits}-${dv}`
  }

  return raw
}

/**
 * Formatea un número telefónico al formato internacional moderno: +58 (414) 123-4567.
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '—'
  const phoneClean = phone.trim()
  const hasPlus = phoneClean.startsWith('+')
  const digits = phoneClean.replace(/\D/g, '')

  if (!digits) return '—'

  // Formato venezolano de 11 dígitos (04141234567)
  if (digits.startsWith('0') && digits.length === 11) {
    const area = digits.slice(1, 4)
    const num = digits.slice(4)
    return `+58 (${area}) ${num.slice(0, 3)}-${num.slice(3)}`
  }

  // Formato venezolano de 12 dígitos con 58 (584141234567)
  if (digits.startsWith('58') && digits.length === 12) {
    const area = digits.slice(2, 5)
    const num = digits.slice(5)
    return `+58 (${area}) ${num.slice(0, 3)}-${num.slice(3)}`
  }

  // Formato local 10 dígitos (4141234567)
  if (digits.length === 10 && /^(412|414|424|416|426|212)/.test(digits)) {
    const area = digits.slice(0, 3)
    const num = digits.slice(3)
    return `+58 (${area}) ${num.slice(0, 3)}-${num.slice(3)}`
  }

  const prefix = hasPlus ? '+' : ''
  if (digits.length > 7) {
    return `${prefix}${digits.slice(0, -7)} ${digits.slice(-7, -4)}-${digits.slice(-4)}`
  }
  return `${prefix}${digits}`
}

/**
 * Formatea SKUs y códigos a mayúsculas sin espacios.
 */
export function formatSKU(sku?: string | null): string {
  if (!sku) return '—'
  return sku.replace(/\s+/g, '').toUpperCase()
}
