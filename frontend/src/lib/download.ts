/** Extrae el nombre de archivo del header `Content-Disposition: attachment; filename="..."`. */
export function extraerNombreDeDisposition(value: string | undefined | null): string | null {
  if (!value) return null
  const match = value.match(/filename="?([^";]+)"?/i)
  return match ? match[1] : null
}

/** Dispara la descarga del blob como archivo (crea objectURL + click + cleanup). */
export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}