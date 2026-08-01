import { useNavigate } from 'react-router'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { useLogout } from '@/hooks/useLogout'
import { ROLES } from '@/lib/constants/choices'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const logout = useLogout()

  const nombre = user ? `${user.nombre} ${user.apellido}`.trim() : 'Usuario'
  const iniciales = user ? `${user.nombre[0] ?? ''}${user.apellido[0] ?? ''}`.toUpperCase() : '?'
  const rol = user ? ROLES[user.rol]?.label ?? user.rol : ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex cursor-pointer items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-surface-container-low"
          aria-label="Menú de usuario"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container-highest text-sm font-bold text-primary">
            {iniciales}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight">{nombre}</p>
            <p className="text-xs text-on-surface-variant">{rol}</p>
          </div>
          <Icon
            name="expand_more"
            className="hidden text-on-surface-variant sm:block"
            size={18}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="text-sm font-semibold">{nombre}</p>
          <p className="text-xs font-normal text-on-surface-variant">
            @{user?.nombre_usuario}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <Icon name="account_circle" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <Icon name="lock" /> Cambiar contraseña
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <Icon name="logout" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
