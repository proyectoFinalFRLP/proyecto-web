import { Box, Breadcrumbs, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// `styled(Typography)` pierde el tipo del prop `component`, y con `as` Emotion
// reemplaza al Typography por la etiqueta pelada: se van la variante y el reset
// de márgenes. Declararlo devuelve las dos.
interface AsProp {
  component?: ElementType
}

// Breadcrumb de S08: versalitas en `labelCaps` y el chevron atenuado.
export const Crumbs = styled(Breadcrumbs)(({ theme }) => ({
  ...theme.typography.labelCaps,
  color: theme.vars.palette.text.secondary,
  '& .MuiBreadcrumbs-separator': { marginInline: theme.spacing(0.5) },
  '& .MuiBreadcrumbs-li': { display: 'flex' },
  // El tramo navegable es texto plano hasta el hover, como en el diseño.
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
}))

// Último tramo: el id de la orden, en la familia monoespaciada y en el color de acción.
export const CurrentCrumb = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelCaps,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.vars.palette.primary.main,
}))

// `wrap` para que en pantallas angostas las acciones caigan abajo en vez de
// comprimir el título.
export const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}))

// El título de S08 va en `h1` con la familia monoespaciada: es un identificador.
export const OrderTitle = styled(Typography)<AsProp>(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  overflowWrap: 'anywhere',
}))

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginLeft: 'auto',
  flexWrap: 'wrap',
}))
