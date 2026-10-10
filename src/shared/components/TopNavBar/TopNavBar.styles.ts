import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Link } from 'react-router-dom'

export const BrandLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontFamily: theme.typography.fontFamily,
  fontSize: '1.125rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  color: theme.vars.palette.primary.main,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: { display: 'none' },
}))

// Nombre de la empresa, separado de la marca del producto por una divisoria.
// Se trunca en vez de empujar la barra: hay razones sociales largas y la
// búsqueda y las acciones no pueden perder su lugar.
export const OrganizationName = styled(Box)(({ theme }) => ({
  ...theme.typography.labelMd,
  maxWidth: 220,
  marginInlineStart: theme.spacing(1.5),
  paddingInlineStart: theme.spacing(1.5),
  borderInlineStart: `1px solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.text.secondary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: { display: 'none' },
}))

export const userMenuPaperSx = (theme: Theme) => ({
  mt: 1,
  minWidth: 200,
  borderRadius: '8px',
  border: `1px solid ${theme.vars.palette.divider}`,
  backgroundColor: theme.vars.palette.background.paper,
  backgroundImage: 'none',
  boxShadow: theme.vars.elevation[2].boxShadow,
})
