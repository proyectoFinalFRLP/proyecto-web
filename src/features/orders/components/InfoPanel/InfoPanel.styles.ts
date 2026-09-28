import { Box, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ElementType } from 'react'

// `styled()` pierde el tipo del prop `component` de los componentes de MUI, y
// con `as` Emotion los reemplaza por la etiqueta pelada: el Card perdería el
// borde y la sombra del tema. Declararlo devuelve las dos cosas.
interface AsProp {
  component?: ElementType
}

// Paneles de la columna lateral de S08: más compactos que las tarjetas del
// cuerpo, con el rótulo en versalitas y el ícono a la derecha.
export const PanelCard = styled(Card)<AsProp>(({ theme }) => ({
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

export const PanelHeading = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
  '& > svg': { marginLeft: 'auto', fontSize: theme.typography.h3.fontSize },
}))

export const FieldList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: 0,
}))

export const Field = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  minWidth: 0,
  // `dd` trae margen propio del navegador.
  '& dd': { margin: 0 },
}))

interface FieldValueProps extends AsProp {
  mono: boolean
  unknown: boolean
}

const TRANSIENT_PROPS = new Set<string>(['mono', 'unknown'])

export const FieldValue = styled(Typography, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<FieldValueProps>(({ theme, mono, unknown }) => ({
  ...theme.typography.bodyMd,
  fontFamily: mono ? theme.typography.dataMono.fontFamily : undefined,
  color: unknown ? theme.vars.palette.text.disabled : theme.vars.palette.text.primary,
  overflowWrap: 'anywhere',
}))
