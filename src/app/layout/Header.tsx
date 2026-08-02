import { TopNavBar } from 'shared/components'
import { useUiStore } from 'shared/store'

export function Header() {
  const { themeMode, toggleTheme, toggleSidebar } = useUiStore()

  return (
    <TopNavBar
      brandTo="/"
      onToggleSidebar={toggleSidebar}
      themeMode={themeMode}
      onToggleTheme={toggleTheme}
    />
  )
}
