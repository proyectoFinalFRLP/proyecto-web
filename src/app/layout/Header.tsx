import { useState } from 'react'
import { ActivityPanel, TopNavBar } from 'shared/components'
import type { TopNavUser } from 'shared/components'
import { useAuthStore, useTenantName, useUiStore } from 'shared/store'
import { useThemeMode } from 'shared/store/uiStore'

// Las rutas de destino del panel se declaran acá y no se importan del router:
// `shared/components` no puede depender de `app/`. El de eventos fallidos
// todavía no existe (TESIS-147); sin él la fila se muestra y no enlaza.
const ACTIVITY_PATHS = { order: (id: number) => `/orders/${id}` }

export function Header() {
  // Selectores individuales (no el store completo): Header está en todas las
  // pantallas vía TopNavBar, así que solo re-renderiza cuando cambia una de
  // estas slices, no ante cualquier cambio del store.
  const themeMode = useThemeMode()
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const sessionUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const organization = useTenantName()
  // El botón que abrió el panel: el Popover se ancla a él, y `null` lo cierra.
  const [bell, setBell] = useState<HTMLElement | null>(null)

  // `sessionUser` es null hasta que `GET /me` contesta, también al recargar la
  // página con sesión abierta. El menú de cuenta cae a su nombre genérico
  // durante ese instante en vez de mostrar un correo que la API no confirmó.
  const user: TopNavUser | undefined = sessionUser
    ? { name: sessionUser.email, company: sessionUser.companyName }
    : undefined

  return (
    <TopNavBar
      brandTo="/"
      organization={organization}
      onToggleSidebar={toggleSidebar}
      themeMode={themeMode}
      onToggleTheme={toggleTheme}
      user={user}
      onLogout={logout}
      onNotificationsClick={setBell}
    >
      <ActivityPanel anchorEl={bell} onClose={() => setBell(null)} paths={ACTIVITY_PATHS} />
    </TopNavBar>
  )
}
