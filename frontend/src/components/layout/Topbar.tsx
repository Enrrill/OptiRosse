import { Link, useLocation } from 'react-router'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/ThemeProvider'
import { useUIStore } from '@/store/useUI'
import { getNavBreadcrumb } from '@/lib/constants/nav'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'

function TopbarBreadcrumb({ pathname }: { pathname: string }) {
  const segments = getNavBreadcrumb(pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const isOnly = segments.length === 1

        return (
          <span key={index} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <Icon
                name="chevron_right"
                size={14}
                className="shrink-0 text-outline/50"
              />
            )}
            {segment.to && !isLast ? (
              <Link
                to={segment.to}
                className={cn(
                  'truncate text-sm font-medium transition-colors hover:text-primary',
                  isOnly
                    ? 'font-heading text-lg font-bold text-primary'
                    : 'text-on-surface-variant',
                )}
              >
                {segment.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'truncate text-sm font-medium',
                  isLast && !isOnly
                    ? 'font-semibold text-primary'
                    : isOnly
                      ? 'font-heading text-lg font-bold text-primary'
                      : 'text-on-surface-variant',
                )}
              >
                {segment.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

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
        <TopbarBreadcrumb pathname={location.pathname} />
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
