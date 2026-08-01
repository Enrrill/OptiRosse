import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/app/ThemeProvider'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster(props: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-container-lowest group-[.toaster]:text-foreground group-[.toaster]:border-outline-variant group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-on-surface-variant',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-on-primary',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
