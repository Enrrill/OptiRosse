import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router'
import { LogIn, Sun, Moon } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/errors'
import { useAuthStore } from '@/store/useAuth'
import { useToast } from '@/store/useToast'
import type { ApiResponse } from '@/types/api'
import type { Usuario } from '@/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/forms/FieldError'
import { useTheme } from '@/app/ThemeProvider'

const loginSchema = z.object({
  identificador: z.string().min(1, 'Ingresa tu nombre de usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

function LensBlurLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const { toggleTheme, theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const { data } = await apiClient.post<ApiResponse<{ access: string; refresh: string }>>(
        AUTH_ENDPOINTS.login,
        values,
      )
      setTokens(data.data.access, data.data.refresh)

      const me = await apiClient.get<ApiResponse<Usuario>>(AUTH_ENDPOINTS.me)
      setUser(me.data.data)

      navigate(from, { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      toast.error(apiErr.defaultMessage || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-gradient bg-pattern p-4">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-on-surface-variant backdrop-blur-md transition-colors hover:bg-surface hover:text-primary"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-[95%] max-w-[420px] rounded-2xl border border-outline-variant bg-surface/95 p-8 shadow-lg backdrop-blur-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-md">
            <LensBlurLogo size={32} />
          </div>
          <div>
            <h1 className="font-heading text-headline-lg font-bold text-primary">
              OptiRosse
            </h1>
            <p className="text-sm text-on-surface-variant">
              Sistema de gestión óptica
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="identificador">Usuario o correo</Label>
            <Input
              id="identificador"
              autoComplete="username"
              placeholder="usuario@optica.com"
              {...register('identificador')}
            />
            <FieldError message={errors.identificador?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {!loading && <LogIn />}
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-outline">
          v1.2.0 Professional · Reporte de incidencias en el módulo de soporte
        </p>
      </div>
    </div>
  )
}
