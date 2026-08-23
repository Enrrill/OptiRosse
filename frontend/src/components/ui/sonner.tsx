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
            'group toast group-[.toaster]:bg-surface-container-lowest/95 group-[.toaster]:text-on-surface group-[.toaster]:border group-[.toaster]:border-outline-variant/60 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-sm group-[.toaster]:font-medium transition-all duration-200',
          title: 'group-[.toast]:font-semibold group-[.toast]:text-on-surface',
          description: 'group-[.toast]:text-on-surface-variant group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-on-primary group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-surface-container-high group-[.toast]:text-on-surface-variant group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs',
          closeButton:
            'group-[.toast]:bg-surface-container-low group-[.toast]:text-on-surface-variant group-[.toast]:hover:bg-surface-container-high group-[.toast]:hover:text-on-surface group-[.toast]:border-outline-variant/40 group-[.toast]:transition-colors',
          success:
            'group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/10 group-[.toast]:text-emerald-950 dark:group-[.toast]:text-emerald-100',
          error:
            'group-[.toaster]:border-rose-500/30 group-[.toaster]:bg-rose-500/10 group-[.toast]:text-rose-950 dark:group-[.toast]:text-rose-100',
          warning:
            'group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-500/10 group-[.toast]:text-amber-950 dark:group-[.toast]:text-amber-100',
          info:
            'group-[.toaster]:border-sky-500/30 group-[.toaster]:bg-sky-500/10 group-[.toast]:text-sky-950 dark:group-[.toast]:text-sky-100',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
