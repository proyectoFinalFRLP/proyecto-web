import { CssBaseline, ThemeProvider } from '@mui/material'
import { brandingFromSlug } from 'app/theme/branding'
import { createAppTheme } from 'app/theme/theme'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useTenantStore, useUiStore } from 'shared/store'

export function ThemeWrapper({ children }: { children: ReactNode }) {
  const themeMode = useUiStore((state) => state.themeMode)
  const slug = useTenantStore((state) => state.slug)
  const config = useTenantStore((state) => state.config)

  const theme = useMemo(() => {
    // Mientras `/tenant-config` está en vuelo la identidad se deriva del slug:
    // el arranque nunca muestra el tema base genérico (§5 del contrato). Sin
    // slug no hay nada que derivar, y lo que se monta es la pantalla de tenant
    // desconocido, que no necesita marca.
    const branding = config?.branding ?? (slug ? brandingFromSlug(slug, themeMode) : undefined)
    return createAppTheme(themeMode, branding)
  }, [themeMode, slug, config])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
