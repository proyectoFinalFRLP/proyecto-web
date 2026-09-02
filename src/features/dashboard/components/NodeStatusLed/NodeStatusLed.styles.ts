import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { StatusVariant } from 'shared/components'

import type { NodeSyncStatus } from '../../types'

// Mapeo del estado del nodo al color semántico del DS. Azul (`info`) = sync
// reciente, rojo (`error`) = fuera de la ventana de latencia, y `neutral` para
// el nodo que no reporta: apagado, no alarmado.
export const LED_TONE: Record<NodeSyncStatus, StatusVariant> = {
  online: 'info',
  stale: 'error',
  unknown: 'neutral',
}

// Geometría del LED y de su halo. Valores en px salvo `glowAlpha` (porcentaje).
const LED = { size: 10, glowBlur: 8, glowSpread: 1, glowAlpha: 55 }

interface LedDotProps {
  tone: StatusVariant
  glowing: boolean
}

const TRANSIENT_PROPS = new Set<string>(['tone', 'glowing'])

export const LedDot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<LedDotProps>(({ theme, tone, glowing }) => {
  const color = theme.palette[tone]

  return {
    // `50%` es la forma (círculo), no un radio del DS: no sale de tokens.
    borderRadius: '50%',
    width: LED.size,
    height: LED.size,
    flexShrink: 0,
    backgroundColor: color.main,
    // Halo tomado del color del estado. `color-mix` en lugar de un rgba fijo:
    // el color viene del theme y el halo funciona igual en light y en dark.
    boxShadow: glowing
      ? `0 0 ${LED.glowBlur}px ${LED.glowSpread}px color-mix(in srgb, ${color.main} ${LED.glowAlpha}%, transparent)`
      : 'none',
  }
})
