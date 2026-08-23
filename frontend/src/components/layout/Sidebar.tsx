import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import { navItemsForRole } from '@/lib/constants/nav'
import { useAuthStore } from '@/store/useAuth'
import { useUIStore } from '@/store/useUI'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarNavProps {
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const user = useAuthStore((s) => s.user)
  const openLogoutModal = useUIStore((s) => s.openLogoutModal)
  const items = navItemsForRole(user?.rol)

  const iniciales = user
    ? (user.nombre?.[0] && user.apellido?.[0]
        ? `${user.nombre[0]}${user.apellido[0]}`
        : user.nombre?.[0] || user.nombre_usuario?.[0] || 'U'
      ).toUpperCase()
    : '?'
  const nombre = user ? `${user.nombre} ${user.apellido}`.trim() || user.nombre_usuario : 'Usuario'

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
      collapsed && 'justify-center px-0',
      isActive
        ? 'bg-primary-container/15 font-bold text-primary shadow-2xs'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
    )

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          'mb-6 flex items-center gap-3',
          collapsed ? 'justify-center' : 'px-2',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/30">
          <Icon name="lens_blur" filled size={22} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight text-primary tracking-tight">
              OptiRosse
            </h1>
            <p className="font-mono text-[11px] font-medium text-outline">v1.2.0 Professional</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={linkClasses}
            >
              <Icon name={item.icon} className="shrink-0" size={20} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )

          if (!collapsed) return link

          return (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant/60 pt-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openLogoutModal}
                className="flex w-full items-center justify-center rounded-xl py-2.5 text-on-surface-variant transition-colors hover:bg-error-container/20 hover:text-error"
                aria-label="Cerrar sesión"
              >
                <Icon name="logout" size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openLogoutModal}
                className="group flex w-full items-center justify-between rounded-xl bg-surface-container-low/60 p-2.5 transition-all duration-200 hover:bg-error-container/20 hover:text-error cursor-pointer border border-transparent hover:border-error-container/40"
                aria-label="Cerrar sesión"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary group-hover:bg-error-container/30 group-hover:text-error transition-colors">
                    {iniciales}
                  </div>
                  <div className="truncate text-left">
                    <p className="truncate text-xs font-semibold text-on-surface group-hover:text-error leading-tight transition-colors">{nombre}</p>
                    <p className="truncate text-[11px] text-on-surface-variant group-hover:text-error/80 transition-colors">@{user?.nombre_usuario}</p>
                  </div>
                </div>
                <Icon name="logout" size={18} className="shrink-0 text-on-surface-variant group-hover:text-error transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Cerrar sesión</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const mobileOpen = useUIStore((s) => s.mobileOpen)
  const closeMobile = useUIStore((s) => s.closeMobile)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface px-2 py-4 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarNav collapsed={false} onNavigate={closeMobile} />
      </aside>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-outline-variant bg-surface px-2 py-4 transition-all duration-300 lg:flex',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>
    </>
  )
}
