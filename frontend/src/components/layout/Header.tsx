import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/useUI'
import { useTheme } from '@/app/ThemeProvider'
import { Breadcrumb } from './Breadcrumb'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const openMobile = useUIStore((s) => s.openMobile)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-[--header-height] items-center justify-between gap-4 border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-md transition-[left] duration-300"
      style={{ left: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      <div className="flex min-w-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={openMobile}
          aria-label="Abrir menú"
        >
          <Menu />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  )
}
