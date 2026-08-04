import { Typography } from '@mui/material'

import { Root, Step, StepsRow } from './ProgressIndicator.styles'
import type { StepsProgressProps } from './ProgressIndicator.types'

/**
 * Progreso por etapas discretas. Para procesos con pasos nombrados (un wizard,
 * el ciclo de vida de un envío) donde un porcentaje continuo no dice nada.
 */
export function StepsProgress({
  total,
  completed,
  tone = 'primary',
  label,
  caption,
}: StepsProgressProps) {
  const steps = Math.max(0, Math.trunc(total))
  const done = Math.min(steps, Math.max(0, Math.trunc(completed)))

  return (
    <Root>
      {label ? <Typography variant="labelMd">{label}</Typography> : null}
      <StepsRow
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={steps}
        aria-valuenow={done}
      >
        {Array.from({ length: steps }, (_unused, index) => (
          <Step key={index} tone={tone} filled={index < done} />
        ))}
      </StepsRow>
      {caption ? (
        <Typography variant="labelSm" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {caption}
        </Typography>
      ) : null}
    </Root>
  )
}
