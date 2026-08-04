import { Typography } from '@mui/material'
import type { ReactNode } from 'react'

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
  return (
    <ShellRoot>
      <BackgroundGlow placement="top" />
      <BackgroundGlow placement="bottom" />

      <TopBar>
        <Typography variant="labelMd" color="primary.main" sx={{ letterSpacing: '0.08em' }}>
          {authContent.brand}
        </Typography>
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
