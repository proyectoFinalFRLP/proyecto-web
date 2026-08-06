import { Box, Typography } from '@mui/material'
import { useId } from 'react'

import {
  Fill,
  HeaderRow,
  IndeterminateFill,
  InlineRoot,
  Root,
  Track,
} from './ProgressIndicator.styles'
import type { ProgressIndicatorProps } from './ProgressIndicator.types'

const DEFAULT_LABEL_WIDTH = 96

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value))
}

/**
 * Barra de progreso lineal con tono semántico. El ancho sale del porcentaje, así
 * que la misma barra sirve para salud del sistema, capacidad o tasa de error:
 * lo único que cambia es el tono.
 */
export function ProgressIndicator({
  value = 0,
  tone = 'primary',
  size = 'medium',
  label,
  ariaLabel,
  showValue = false,
  indeterminate = false,
  layout = 'stacked',
  labelWidth = DEFAULT_LABEL_WIDTH,
}: ProgressIndicatorProps) {
  const labelId = useId()
  const percent = clampPercent(value)
  // Un progreso desconocido no puede anunciar un valor: se omite `aria-valuenow`
  // para que el lector de pantalla lo lea como indeterminado.
  const ariaValue = indeterminate ? undefined : Math.round(percent)

  // Con label visible se apunta a él con `aria-labelledby` en vez de repetir el
  // texto en `aria-label`: si no, el lector anuncia el mismo nombre dos veces,
  // una como texto de la fila y otra como nombre de la barra.
  const naming = label ? { 'aria-labelledby': labelId } : { 'aria-label': ariaLabel ?? undefined }

  const bar = (
    <Track
      tone={tone}
      barSize={size}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValue}
      {...naming}
    >
      {indeterminate ? (
        <IndeterminateFill tone={tone} />
      ) : (
        <Fill tone={tone} sx={{ width: `${percent}%` }} />
      )}
    </Track>
  )

  // En `stacked` el porcentaje toma el color del tono (refuerza el estado de esa
  // métrica); en `inline` va en texto primario, porque varias filas comparables
  // con cada número de un color distinto se leen como un semáforo y no como una
  // tabla. Así lo distingue el spec.
  const valueText = showValue ? (
    <Typography variant="labelMd" color={layout === 'inline' ? 'text.primary' : `${tone}.main`}>
      {`${Math.round(percent)}%`}
    </Typography>
  ) : null

  if (layout === 'inline') {
    return (
      <InlineRoot>
        {label ? (
          <Box sx={{ width: labelWidth, flexShrink: 0 }}>
            <Typography id={labelId} variant="labelMd">
              {label}
            </Typography>
          </Box>
        ) : null}
        {bar}
        {valueText ? <Box sx={{ textAlign: 'right', minWidth: 40 }}>{valueText}</Box> : null}
      </InlineRoot>
    )
  }

  const hasHeader = Boolean(label) || valueText !== null

  return (
    <Root>
      {hasHeader ? (
        <HeaderRow>
          <Typography id={labelId} variant="labelMd">
            {label}
          </Typography>
          {valueText}
        </HeaderRow>
      ) : null}
      {bar}
    </Root>
  )
}
