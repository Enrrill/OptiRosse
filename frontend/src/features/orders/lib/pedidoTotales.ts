export const IVA_RATE = 0.16

export interface LineaPrecio {
  precio_unitario: number | null | undefined
  cantidad: number | string | null | undefined
}

export function calcularTotalesLineas(lineas: LineaPrecio[]): {
  subtotal: number
  impuesto: number
  total: number
} {
  const subtotal = lineas.reduce((suma, linea) => {
    const precio = Number(linea.precio_unitario) || 0
    const cantidad = Number(linea.cantidad) || 0
    return suma + precio * cantidad
  }, 0)
  const impuesto = subtotal * IVA_RATE
  return { subtotal, impuesto, total: subtotal + impuesto }
}

export function totalLinea(linea: {
  precio_unitario?: number | string | null
  cantidad?: number | string | null
}): number {
  return (Number(linea.precio_unitario) || 0) * (Number(linea.cantidad) || 0)
}