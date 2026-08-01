import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import { navItemsForRole } from '@/lib/constants/nav'
import { useAuthStore } from '@/store/useAuth'
import { useUIStore } from '@/store/useUI'
import { useLogout } from '@/hooks/useLogout'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarNavProps {
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const items = navItemsForRole(user?.rol)

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors',
      collapsed && 'justify-center px-0',
      isActive
        ? 'bg-surface-container-high font-bold text-primary'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
    )

  return (
    <>
      <div
        className={cn(
          'mb-6 flex items-center gap-2.5',
          collapsed ? 'justify-center' : 'px-1',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Icon name="lens_blur" filled />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-headline-md font-bold leading-tight text-primary">
              OptiRosse
            </h1>
            <p className="font-label-sm text-label-sm text-outline">v1.2.0 Professional</p>
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
              <Icon name={item.icon} className="shrink-0" />
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

      <div className="mt-auto space-y-1 border-t border-outline-variant pt-3">
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-error-container/30 hover:text-error',
            collapsed && 'justify-center px-0',
          )}
        >
          <Icon name="logout" className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
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
