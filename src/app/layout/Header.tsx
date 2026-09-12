import { TopNavBar } from 'shared/components'
import type { TopNavUser } from 'shared/components'
import { useAuthStore, useUiStore } from 'shared/store'

export function Header() {
  // Selectores individuales (no el store completo): Header está en todas las
  // pantallas vía TopNavBar, así que solo re-renderiza cuando cambia una de
  // estas slices, no ante cualquier cambio del store.
  const themeMode = useUiStore((state) => state.themeMode)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const sessionUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  // `sessionUser` es null hasta que `GET /me` contesta, también al recargar la
  // página con sesión abierta. El menú de cuenta cae a su nombre genérico
  // durante ese instante en vez de mostrar un correo que la API no confirmó.
  const user: TopNavUser | undefined = sessionUser
    ? { name: sessionUser.email, company: sessionUser.companyName }
    : undefined

  return (
    <TopNavBar
      brandTo="/"
      onToggleSidebar={toggleSidebar}
      themeMode={themeMode}
      onToggleTheme={toggleTheme}
      user={user}
      onLogout={logout}
    />
  )
}
