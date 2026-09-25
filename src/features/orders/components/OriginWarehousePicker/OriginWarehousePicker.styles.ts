import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Tres columnas en el diseño; dos o una cuando no entran.
export const OptionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
}))

export const OptionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  '& > svg': { marginLeft: 'auto', fontSize: 20, flexShrink: 0 },
}))

export const OptionTitle = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

// El motivo por el que un depósito no se puede elegir, sólo para el lector de
// pantalla: a la vista ya lo dice el badge.
export const ScreenReaderOnly = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
})
