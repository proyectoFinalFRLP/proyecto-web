import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { StatusVariant } from 'shared/components'

import type { StageState } from '../../utils/shipment'

// Diámetro del círculo de cada etapa, tomado de S08.
const STAGE_DOT_SIZE = 32

export const LifecycleCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const CardHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.vars.palette.primary.main,
}))

// La acción va contra el borde derecho del encabezado, como las de los
// encabezados de página.
export const CardAction = styled(Box)({
  marginLeft: 'auto',
})

// Cuatro etapas en fila; al angostarse bajan a dos columnas.
export const StageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: theme.spacing(2),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}))

export const StageItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}))

interface StageStateProps {
  stageState: StageState
}

interface StageDotProps extends StageStateProps {
  /** El tono del final sin entrega (`closed`): el mismo del badge del estado. */
  stageTone?: StatusVariant
}

const TRANSIENT_PROPS = new Set<string>(['stageState', 'stageTone'])

// Las etapas alcanzadas llevan el tono de acción; las que faltan quedan
// hundidas y atenuadas, como en el diseño. El final sin entrega (TESIS-188)
// lleva el tono de su estado: no es un paso cumplido del ciclo.
export const StageDot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<StageDotProps>(({ theme, stageState, stageTone = 'neutral' }) => {
  const reached = stageState !== 'pending'

  if (stageState === 'closed') {
    const tone = theme.vars.palette[stageTone]

    return {
      width: STAGE_DOT_SIZE,
      height: STAGE_DOT_SIZE,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tone.container,
      border: `1px solid ${tone.main}`,
      color: tone.main,
      '& > svg': { fontSize: theme.typography.h3.fontSize },
    }
  }

  return {
    width: STAGE_DOT_SIZE,
    height: STAGE_DOT_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: reached
      ? theme.vars.palette.primary.container
      : theme.vars.palette.background.layer.floor,
    border: `1px solid ${reached ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
    color: reached ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
    '& > svg': { fontSize: theme.typography.h3.fontSize },
  }
})

export const StageLabel = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<StageStateProps>(({ theme, stageState }) => ({
  ...theme.typography.labelMd,
  fontSize: theme.typography.bodyMd.fontSize,
  color:
    stageState === 'pending' ? theme.vars.palette.text.secondary : theme.vars.palette.text.primary,
}))

export const StageWhen = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelSm,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.vars.palette.text.secondary,
}))
