import { useState } from 'react'
import { ActivityPanel, TopNavBar } from 'shared/components'
import type { TopNavUser } from 'shared/components'
import { useAuthStore, useTenantName, useUiStore } from 'shared/store'
import { useThemeMode } from 'shared/store/uiStore'

import { ACTIVITY_PATHS } from './activityPaths'
import { useSidebar } from './useSidebar'

export function Header() {
  // Selectores individuales (no el store completo): Header está en todas las
  // pantallas vía TopNavBar, así que solo re-renderiza cuando cambia una de
  // estas slices, no ante cualquier cambio del store.
  const themeMode = useThemeMode()
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  // La hamburguesa abre o cierra la sidebar del modo actual: la fija en
  // pantallas anchas, la flotante en las angostas (ver `useSidebar`).
  const sidebar = useSidebar()
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
      onToggleSidebar={sidebar.toggle}
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
