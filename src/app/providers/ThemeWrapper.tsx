import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from 'app/theme/theme'
import type { ReactNode } from 'react'
import { useUiStore } from 'shared/store'

export function ThemeWrapper({ children }: { children: ReactNode }) {
  const themeMode = useUiStore((state) => state.themeMode)
  const theme = createAppTheme(themeMode)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
