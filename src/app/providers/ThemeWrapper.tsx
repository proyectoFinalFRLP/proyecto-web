import { CssBaseline, ThemeProvider, useColorScheme } from '@mui/material'
import { brandingFromSlug } from 'app/theme/branding'
import { createAppTheme } from 'app/theme/theme'
import type { ThemeMode } from 'app/theme/tokens'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useTenantStore } from 'shared/store'
import { useThemeMode } from 'shared/store/uiStore'

export function ThemeWrapper({ children }: { children: ReactNode }) {
  // Modo efectivo: elección del usuario, o la del tenant si nunca eligió.
  const themeMode = useThemeMode()
  const slug = useTenantStore((state) => state.slug)
  const config = useTenantStore((state) => state.config)

  // El tema trae los dos esquemas (claro y oscuro), así que se arma por tenant
  // y no por modo: alternar el modo no crea un tema nuevo (TESIS-104).
  const theme = useMemo(() => {
    // Mientras `/tenant-config` está en vuelo la identidad se deriva del slug:
    // el arranque nunca muestra el tema base genérico (§5 del contrato). Sin
    // slug no hay nada que derivar, y lo que se monta es la pantalla de tenant
    // desconocido, que no necesita marca.
    const brandingFor = (mode: ThemeMode) =>
      config?.branding ?? (slug ? brandingFromSlug(slug, mode) : undefined)
    return createAppTheme({ light: brandingFor('light'), dark: brandingFor('dark') })
  }, [slug, config])

  return (
    // `storageManager={null}`: el modo lo guarda `uiStore`, que además sabe del
    // default del tenant. Sin esto MUI guardaría su propia copia en
    // localStorage y las dos podrían no coincidir.
    //
    // `disableTransitionOnChange`: el cambio de esquema es instantáneo, como
    // cuando se rearmaba el tema. Sin esto, cada elemento con transición sobre
    // su color (el indicador de las pestañas, los botones) se desvanecería de
    // un esquema al otro.
    <ThemeProvider
      theme={theme}
      defaultMode={themeMode}
      storageManager={null}
      disableTransitionOnChange
    >
      <ColorSchemeSync mode={themeMode} />
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

/**
 * Lleva el modo de `uiStore` al esquema activo de MUI. Cambiar el esquema cambia
 * el atributo `data-light` / `data-dark` del `<html>`, y con eso las variables
 * CSS: el navegador repinta sin que React vuelva a generar estilos.
 */
function ColorSchemeSync({ mode }: { mode: ThemeMode }) {
  const { setMode } = useColorScheme()

  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  return null
}
