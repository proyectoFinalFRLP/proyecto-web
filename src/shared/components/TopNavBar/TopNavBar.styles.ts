import { Box, InputBase } from '@mui/material'
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

interface SearchRootProps {
  expanded?: boolean
}

const SEARCH_TRANSIENT_PROPS = new Set<string>(['expanded'])

export const SearchRoot = styled(Box, {
  shouldForwardProp: (prop) => !SEARCH_TRANSIENT_PROPS.has(prop as string),
})<SearchRootProps>(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: 40,
  paddingInline: theme.spacing(1.5),
  borderRadius: 9999,
  border: `1px solid ${theme.vars.palette.divider}`,
  backgroundColor: theme.alpha(theme.vars.palette.text.primary, 0.04),
  width: expanded ? '100%' : 260,
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  '&:focus-within': {
    borderColor: theme.vars.palette.primary.main,
    boxShadow: `0 0 0 3px ${theme.alpha(theme.vars.palette.primary.main, 0.2)}`,
  },
}))

export const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  color: theme.vars.palette.text.primary,
  ...theme.typography.bodyMd,
  '& ::placeholder': { color: theme.vars.palette.text.secondary, opacity: 1 },
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
