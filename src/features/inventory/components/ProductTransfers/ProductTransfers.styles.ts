import { Box, Card, List, ListItem } from '@mui/material'
import { styled } from '@mui/material/styles'

export const TransfersCard = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

// Mismo alto y separador que la cabecera de la distribución por depósito.
export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 2),
  minHeight: 48,
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}))

export const HeaderText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 240px',
  minWidth: 0,
})

export const TransferList = styled(List)({
  padding: 0,
})

export const TransferRow = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  '&:last-of-type': { borderBottom: 'none' },
}))

export const TransferText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 220px',
  minWidth: 0,
})

export const TransferActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}))

export const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2),
}))
