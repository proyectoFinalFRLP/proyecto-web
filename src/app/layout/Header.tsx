import { TopNavBar } from 'shared/components'
import { useUiStore } from 'shared/store'

export function Header() {
  const themeMode = useUiStore((state) => state.themeMode)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <TopNavBar
      brandTo="/"
      onToggleSidebar={toggleSidebar}
      themeMode={themeMode}
      onToggleTheme={toggleTheme}
    />
  )
}
