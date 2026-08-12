import { useApiMutation } from '@/hooks/useApi'
import { PRODUCTOS, detalle } from '@/lib/api/endpoints'
import type { Producto } from '@/types/models'
import type { ProductoPayload } from '../components/productoSchema'

const INVALIDATES: unknown[][] = [['productos'], ['variantes'], ['dashboard', 'resumen']]

export function useCrearProducto() {
  return useApiMutation<Producto, ProductoPayload>({
    url: PRODUCTOS,
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Producto creado correctamente',
  })
}

export function useActualizarProducto(id: number | null) {
  return useApiMutation<Producto, ProductoPayload>({
    url: id ? detalle(PRODUCTOS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Producto actualizado correctamente',
  })
}

export function useDesactivarProducto(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(PRODUCTOS, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Producto desactivado correctamente',
  })
}

export function useReactivarProducto(id: number | null) {
  return useApiMutation<Producto, { activo: boolean }>({
    url: id ? detalle(PRODUCTOS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Producto reactivado correctamente',
  })
}