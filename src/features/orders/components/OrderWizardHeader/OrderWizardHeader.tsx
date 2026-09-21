import { Typography } from '@mui/material'
import { ProgressIndicator } from 'shared/components'

import { ordersCopy } from '../../content'

import { HeaderRoot, StepCounter, TitleRow } from './OrderWizardHeader.styles'
import type { OrderWizardHeaderProps } from './OrderWizardHeader.types'

const { wizard } = ordersCopy

/**
 * Encabezado de los tres pasos del alta manual: título, etapa, "Paso N de M" y
 * la barra de avance. Cada paso lo monta con su número; el resto es igual.
 */
export function OrderWizardHeader({ step, total, subtitle }: OrderWizardHeaderProps) {
  return (
    <HeaderRoot>
      <TitleRow>
        <Typography variant="h1" component="h1">
          {wizard.title}
        </Typography>
        <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
        <StepCounter variant="labelCaps">{wizard.stepOf(step, total)}</StepCounter>
      </TitleRow>
      <ProgressIndicator
        value={(step / total) * 100}
        size="thin"
        tone="primary"
        ariaLabel={wizard.progressLabel}
      />
    </HeaderRoot>
  )
}
