import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { IconButton, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTenantName, useUiStore } from 'shared/store'

import { authContent } from '../content'

import { BackgroundGlow, ShellFooter, ShellMain, ShellRoot, TopBar } from './AuthShell.styles'

/**
 * Marco de las pantallas públicas de autenticación: barra de marca, contenido
 * centrado y pie legal, sobre el fondo con halos del diseño.
 *
 * Provisional por dos motivos, ambos anotados en el PR: la barra superior real
 * es TESIS-72 (aún en revisión) y el pie compartido no tiene card todavía. El
 * "Help Center" y los enlaces legales del diseño no se incluyen porque no
 * tienen destino: un enlace que no lleva a ninguna parte es peor que su
 * ausencia.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const themeMode = useUiStore((state) => state.themeMode)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  // El login es la primera pantalla y también va con la marca de la empresa: es
  // el portal de ese tenant, no el de un producto genérico (TESIS-121). El
  // fallback sólo se usaría si la app se montara sin config, que el gate de
  // arranque no permite.
  const tenantName = useTenantName()

  const isLight = themeMode === 'light'

  return (
    <ShellRoot>
      <BackgroundGlow placement="top" />
      <BackgroundGlow placement="bottom" />

      <TopBar>
        <Typography variant="labelMd" color="primary.main" sx={{ letterSpacing: '0.08em' }}>
          {tenantName ?? authContent.brand}
        </Typography>

        {/* Añadido respecto del diseño: el toggle de tema vive en el Header de la
            app, que estas rutas públicas no renderizan. Sin esto, quien prefiere
            el tema claro no puede elegirlo hasta después de iniciar sesión. */}
        <Tooltip title={isLight ? authContent.theme.toDark : authContent.theme.toLight}>
          <IconButton onClick={toggleTheme} aria-label={authContent.theme.ariaLabel}>
            {isLight ? <Brightness4Icon fontSize="small" /> : <Brightness7Icon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </TopBar>

      {/* `as` y no `component`: styled() no expone `component`
          (component-structure.md §3.2). */}
      <ShellMain as="main">{children}</ShellMain>

      <ShellFooter as="footer">
        <Typography variant="labelSm" color="text.secondary">
          {authContent.legal}
        </Typography>
      </ShellFooter>
    </ShellRoot>
  )
}
