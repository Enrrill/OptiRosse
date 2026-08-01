import { Icon } from '@/components/Icon'

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <Icon name="progress_activity" className="animate-spin" size={24} />
      </div>
    </div>
  )
}
