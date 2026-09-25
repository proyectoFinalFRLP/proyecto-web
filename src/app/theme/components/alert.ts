import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

// El aviso del sistema del diseño (Alert.dc.html): fondo tonal de la intención,
// borde de su color base, ícono y texto en el tono `onContainer`, radio 8 y
// 12 × 16 de relleno.
//
// Aplica a `standard` y `outlined`, que en la app se usaban indistintamente
// para lo mismo: el diseño tiene un solo aviso, así que las dos variantes pintan
// igual. `filled` queda como la trae MUI; nada la usa.
export function muiAlert(): Components<Theme>['MuiAlert'] {
  return {
    // MUI rotula la X en inglés ("Close") y la app no carga su locale: sin esto,
    // el lector de pantalla anuncia en inglés el cierre de cada toast.
    defaultProps: { closeText: 'Cerrar' },
    styleOverrides: {
      root: ({ theme, ownerState }) => {
        if (ownerState.variant === 'filled') return {}

        // Mismo orden que MUI: `color` pisa a `severity`, y sin ninguno es `success`.
        const color = theme.palette[ownerState.color ?? ownerState.severity ?? 'success']

        return {
          ...theme.typography.bodyMd,
          // 4 + los 8 que MUI ya le pone al mensaje = los 12 del diseño.
          padding: theme.spacing(0.5, 2),
          borderRadius: radius.base,
          border: `1px solid ${color.main}`,
          backgroundColor: color.container,
          color: color.onContainer,
          '& .MuiAlert-icon': { color: color.onContainer, opacity: 1 },
          // Sólo la X va en gris, como en el diseño. La zona de acción también
          // aloja botones como "Reintentar" (`color="inherit"`), y esos tienen
          // que conservar el tono de la intención: son la salida del aviso.
          '& .MuiAlert-action > .MuiIconButton-root': { color: theme.palette.text.secondary },
          // Con título, el título lleva el tono y el cuerpo baja a secundario.
          '& .MuiAlertTitle-root': { fontWeight: 600, color: color.onContainer },
          '&:has(.MuiAlertTitle-root) .MuiAlert-message': { color: theme.palette.text.secondary },
        }
      },
    },
  }
}
