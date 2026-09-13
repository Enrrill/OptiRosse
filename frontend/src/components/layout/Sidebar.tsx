import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { navItemsForRole } from '@/lib/constants/nav'
import { useAuthStore } from '@/store/useAuth'
import { useUIStore } from '@/store/useUI'
import { ROLES } from '@/lib/constants/choices'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DashboardLayout,
  ShoppingCart,
  FileText,
  Users,
  Package,
  DollarSign,
  FolderOpen,
  UserCog,
  Activity,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  LucideIcon,
} from 'lucide-react'
import { useTheme } from '@/app/ThemeProvider'

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: DashboardLayout,
  shopping_cart: ShoppingCart,
  description: FileText,
  groups: Users,
  inventory_2: Package,
  payments: DollarSign,
  folder_shared: FolderOpen,
  history: Activity,
  manage_accounts: UserCog,
}

interface SidebarNavProps {
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const user = useAuthStore((s) => s.user)
  const openLogoutModal = useUIStore((s) => s.openLogoutModal)
  const { theme, toggleTheme } = useTheme()
  const items = navItemsForRole(user?.rol)

  const iniciales = user
    ? (user.nombre?.[0] && user.apellido?.[0]
        ? `${user.nombre[0]}${user.apellido[0]}`
        : user.nombre?.[0] || user.nombre_usuario?.[0] || 'U'
      ).toUpperCase()
    : '?'
  const nombre = user ? `${user.nombre} ${user.apellido}`.trim() || user.nombre_usuario : 'Usuario'
  const rol = user ? ROLES[user.rol]?.label ?? user.rol : ''

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
      collapsed && 'justify-center px-0',
      isActive
        ? 'bg-primary-container/15 font-bold text-primary shadow-2xs'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
    )

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          'mb-6 flex items-center gap-3',
          collapsed ? 'justify-center' : 'px-2',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/30">
          <Package size={22} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight text-primary tracking-tight">
              OptiRosse
            </h1>
            <p className="font-mono text-[11px] font-medium text-outline">v2.0 Professional</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const IconComp = ICON_MAP[item.icon] ?? Package
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={linkClasses}
            >
              <IconComp className="shrink-0" size={20} />
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

      {/* User panel - bottom */}
      <div className="mt-auto border-t border-outline-variant/60 pt-3">
        {collapsed ? (
          <Tooltip>
            <Popover>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    className="flex w-full items-center justify-center rounded-xl py-2.5"
                    aria-label="Menú de usuario"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                      {iniciales}
                    </div>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <PopoverContent side="top" align="start" className="w-56 p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{nombre}</p>
                    <p className="text-xs text-on-surface-variant">{rol}</p>
                  </div>
                  <div className="h-px bg-outline-variant/40" />
                  <button
                    onClick={() => { window.location.href = '/perfil' }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                  >
                    <User size={16} />
                    Ver perfil
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                  </button>
                  <div className="h-px bg-outline-variant/40" />
                  <button
                    onClick={openLogoutModal}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-error hover:bg-error-container/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent side="right">{nombre}</TooltipContent>
          </Tooltip>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="group flex w-full items-center justify-between rounded-xl bg-surface-container-low/60 p-2.5 transition-all duration-200 hover:bg-error-container/20 hover:text-error cursor-pointer border border-transparent hover:border-error-container/40"
                aria-label="Menú de usuario"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary group-hover:bg-error-container/30 group-hover:text-error transition-colors">
                    {iniciales}
                  </div>
                  <div className="truncate text-left">
                    <p className="truncate text-xs font-semibold text-on-surface group-hover:text-error leading-tight transition-colors">{nombre}</p>
                    <p className="truncate text-[11px] text-on-surface-variant group-hover:text-error/80 transition-colors">{rol}</p>
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-56 p-2">
              <div className="space-y-1">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{nombre}</p>
                  <p className="text-xs text-on-surface-variant">@{user?.nombre_usuario}</p>
                </div>
                <div className="h-px bg-outline-variant/40" />
                <button
                  onClick={() => { window.location.href = '/perfil' }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                >
                  <User size={16} />
                  Ver perfil
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                </button>
                <div className="h-px bg-outline-variant/40" />
                <button
                  onClick={openLogoutModal}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-error hover:bg-error-container/20 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileOpen = useUIStore((s) => s.mobileOpen)
  const closeMobile = useUIStore((s) => s.closeMobile)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface px-2 py-4 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarNav collapsed={false} onNavigate={closeMobile} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-outline-variant bg-surface px-2 py-4 transition-all duration-300 lg:flex',
          collapsed ? 'w-[--sidebar-collapsed-width]' : 'w-[--sidebar-width]',
        )}
      >
        <SidebarNav collapsed={collapsed} />

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleSidebar}
          className="mt-3 flex w-full items-center justify-center rounded-xl py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <Menu size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>
    </>
  )
}
