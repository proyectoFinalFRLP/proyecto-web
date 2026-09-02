import { LED_TONE, LedDot } from './NodeStatusLed.styles'
import type { NodeStatusLedProps } from './NodeStatusLed.types'

// Indicador de estado del nodo. El nodo que no reporta sync no tiene halo: el
// glow es señal de que el nodo está vivo, sea sano (azul) o caído (rojo).
export function NodeStatusLed({ status, label }: NodeStatusLedProps) {
  return (
    <LedDot
      role="img"
      aria-label={label}
      title={label}
      tone={LED_TONE[status]}
      glowing={status !== 'unknown'}
    />
  )
}
