import { Loader2 } from 'lucide-react'

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <Loader2 className="animate-spin" size={24} />
      </div>
    </div>
  )
}
