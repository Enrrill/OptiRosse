import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUIStore } from '@/store/useUI'
import { cn } from '@/lib/utils'

export function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          'min-h-screen p-4 pt-20 transition-all duration-300 md:p-6',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
        )}
      >
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
