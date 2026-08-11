import { useApiMutation } from '@/hooks/useApi'
import { USUARIOS, detalle } from '@/lib/api/endpoints'
import type { Usuario } from '@/types/models'
import type { UsuarioPayload } from '../components/usuarioSchema'

export function useCrearUsuario() {
  return useApiMutation<Usuario, UsuarioPayload>({
    url: USUARIOS,
    method: 'post',
    invalidates: [['usuarios']],
    successMessage: 'Usuario creado correctamente',
  })
}

export function useActualizarUsuario(id: number | null) {
  return useApiMutation<Usuario, Partial<UsuarioPayload>>({
    url: id ? detalle(USUARIOS, id) : '',
    method: 'patch',
    invalidates: [['usuarios'], ['auth', 'me']],
    successMessage: 'Usuario actualizado correctamente',
  })
}

export function useDesactivarUsuario(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(USUARIOS, id) : '',
    method: 'delete',
    invalidates: [['usuarios'], ['auth', 'me']],
    successMessage: 'Usuario desactivado correctamente',
  })
}

export function useReactivarUsuario(id: number | null) {
  return useApiMutation<Usuario, { activo: boolean }>({
    url: id ? detalle(USUARIOS, id) : '',
    method: 'patch',
    invalidates: [['usuarios'], ['auth', 'me']],
    successMessage: 'Usuario reactivado correctamente',
  })
}
