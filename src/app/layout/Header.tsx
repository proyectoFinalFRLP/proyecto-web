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

  // El email es lo único que la app sabe del usuario: no viaja en el JWT ni lo
  // devuelve el login, se guarda del formulario. Hasta que exista `GET /me` es
  // también el nombre que muestra el menú de cuenta.
  const user: TopNavUser | undefined = sessionUser ? { name: sessionUser.email } : undefined

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
