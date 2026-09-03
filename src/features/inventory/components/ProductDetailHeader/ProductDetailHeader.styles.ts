import { Box, Breadcrumbs, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// `styled(Typography)` pierde el tipo del prop `component`, y con `as` en su
// lugar Emotion reemplaza al Typography por la etiqueta pelada: se van la
// variante tipográfica y el reset de márgenes. Declararlo devuelve las dos.
interface AsProp {
  component?: ElementType
}

// Breadcrumb del diseño: versalitas en `labelCaps` y el chevron en el color
// secundario. El separador lo dibuja MUI, así que sólo se le da color.
export const Crumbs = styled(Breadcrumbs)(({ theme }) => ({
  ...theme.typography.labelCaps,
  color: theme.palette.text.secondary,
  '& .MuiBreadcrumbs-separator': { marginInline: theme.spacing(0.5) },
  '& .MuiBreadcrumbs-li': { display: 'flex' },
  // El tramo navegable es texto plano hasta el hover, como en el diseño.
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
}))

// Último tramo: el SKU, en la familia monoespaciada y con el color de acción.
export const CurrentCrumb = styled(Typography)(({ theme }) => ({
  ...theme.typography.labelCaps,
  fontFamily: theme.typography.dataMono.fontFamily,
  color: theme.palette.primary.main,
}))

// Fila del título. `wrap` para que en pantallas angostas las acciones caigan
// abajo en vez de comprimir el SKU.
export const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}))

export const TitleGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  flex: '1 1 auto',
  minWidth: 0,
}))

export const TitleLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))

// El SKU en `h1` con la familia monoespaciada, como el título de S12.
export const SkuTitle = styled(Typography)<AsProp>(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
  overflowWrap: 'anywhere',
}))

// Las acciones se alinean a la derecha mientras entren en la misma línea.
export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginLeft: 'auto',
  flexWrap: 'wrap',
}))
