import { alpha } from '@mui/material/styles'
import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

// El modal es el nivel 3 de la escala de elevación: el punto de foco de la app.
// El radio es `md` (12) y no el `lg` de las cards — el DS reserva el radio más
// grande para superficies de contenido, no para overlays.
export function muiDialog(): Components<Theme>['MuiDialog'] {
  return {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: radius.md,
        // Sin el gradiente que MUI pinta por elevación en dark: el DS resuelve
        // la profundidad con borde + sombra, no aclarando la superficie.
        backgroundImage: 'none',
        border: theme.elevation[3].border,
        boxShadow: theme.elevation[3].boxShadow,
      }),
    },
  }
}

// Scrim del overlay. El blur es sutil a propósito: separa el modal del fondo
// sin esconder del todo el contexto de la pantalla que quedó atrás.
//
// El scrim es para lo que interrumpe —diálogo, drawer—, no para lo que sólo se
// despliega. `Menu`, `Select` y `Popover` montan un backdrop con `invisible`
// para capturar el clic de afuera, y este override lo pintaba igual: abrir el
// kebab de una fila oscurecía y desenfocaba la app entera. Se respeta la
// variante en vez de sacar el scrim, así el diálogo conserva el suyo.
export function muiBackdrop(): Components<Theme>['MuiBackdrop'] {
  return {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: alpha(
          theme.palette.common.black,
          theme.palette.mode === 'dark' ? 0.6 : 0.4,
        ),
        backdropFilter: 'blur(2px)',
        '&.MuiBackdrop-invisible': {
          backgroundColor: 'transparent',
          backdropFilter: 'none',
        },
      }),
    },
  }
}
