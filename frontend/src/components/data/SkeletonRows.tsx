import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonRows({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-outline-variant/30 py-4"
        >
          <Skeleton className="h-4 w-24 shrink-0" />
          {Array.from({ length: Math.max(0, columns - 1) }).map((__, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
