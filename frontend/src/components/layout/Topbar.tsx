import { useLocation } from 'react-router'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/ThemeProvider'
import { useUIStore } from '@/store/useUI'
import { getNavTitle } from '@/lib/constants/nav'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'

export function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const openMobile = useUIStore((s) => s.openMobile)
  const location = useLocation()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-md transition-all duration-300',
        collapsed ? 'lg:left-[72px]' : 'lg:left-64',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={openMobile}
          aria-label="Abrir menú"
        >
          <Icon name="menu" />
        </Button>
        <h2 className="truncate font-heading text-headline-md font-bold text-primary">
          {getNavTitle(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
