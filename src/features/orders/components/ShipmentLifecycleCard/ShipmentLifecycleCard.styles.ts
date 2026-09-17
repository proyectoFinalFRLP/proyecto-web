import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

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
  color: theme.palette.primary.main,
}))

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

const TRANSIENT_PROPS = new Set<string>(['stageState'])

// Las etapas alcanzadas llevan el tono de acción; las que faltan quedan
// hundidas y atenuadas, como en el diseño.
export const StageDot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<StageStateProps>(({ theme, stageState }) => {
  const reached = stageState !== 'pending'

  return {
    width: STAGE_DOT_SIZE,
    height: STAGE_DOT_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: reached
      ? theme.palette.primary.container
      : theme.palette.background.layer.floor,
    border: `1px solid ${reached ? theme.palette.primary.main : theme.palette.divider}`,
    color: reached ? theme.palette.primary.main : theme.palette.text.secondary,
    '& > svg': { fontSize: theme.typography.h3.fontSize },
  }
})

export const StageLabel = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<StageStateProps>(({ theme, stageState }) => ({
  ...theme.typography.labelMd,
  fontSize: theme.typography.bodyMd.fontSize,
  color: stageState === 'pending' ? theme.palette.text.secondary : theme.palette.text.primary,
}))

export const StageWhen = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelSm,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.palette.text.secondary,
}))
