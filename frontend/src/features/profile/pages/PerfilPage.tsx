import { PlaceholderPage } from '@/features/dashboard/components/PlaceholderPage'

export default function PerfilPage() {
  const item = { to: '/perfil', label: 'Perfil', icon: 'account_circle' }
  return <PlaceholderPage item={item} description="Datos del usuario, cambio de contraseña y sesión." />
}
