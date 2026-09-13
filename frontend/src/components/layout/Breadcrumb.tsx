import { Link, useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { getNavBreadcrumb } from '@/lib/constants/nav'
import { cn } from '@/lib/utils'

export function Breadcrumb() {
  const location = useLocation()
  const segments = getNavBreadcrumb(location.pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const isOnly = segments.length === 1

        return (
          <span key={index} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <ChevronRight size={14} className="shrink-0 text-outline/50" />
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
