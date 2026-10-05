import { Box, Card } from '@mui/material'
import { styled } from '@mui/material/styles'

// El Card del tema ya trae borde, sombra y radio: acá sólo el layout interno.
export const ChannelsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const MappingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}))

export const MappingIdentity = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflowWrap: 'anywhere',
})

// Canal + id + botón en una fila; en pantallas angostas se apilan.
export const LinkForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  alignItems: 'start',
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: { gridTemplateColumns: '220px minmax(0, 1fr) auto' },
}))

// El botón queda a la altura del input y no del label que tiene arriba.
export const LinkAction = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: { paddingTop: theme.spacing(3) },
}))
