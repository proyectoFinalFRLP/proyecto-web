import { MenuItem } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

import type { StatusVariant } from '../StatusBadge'

// Paper del menú — superficie del tema, borde `divider`, radio 8, padding 6,
// gap 2, shadow y scroll interno (DS sección 12).
export const menuPaperSx = (theme: Theme) => ({
  mt: 0.5,
  minWidth: 200,
  maxWidth: 260,
  maxHeight: 320,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  backgroundImage: 'none',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 12px 32px rgba(0,0,0,0.5)'
      : '0 12px 32px rgba(16,24,40,0.12)',
  '& .MuiList-root': {
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
})

// Ítem del menú — 8px 10px, radio 6, hover `containerHighest`,
// seleccionado con tint acento 10% + color de texto primario.
export const StatusMenuItem = styled(MenuItem)(({ theme }) => ({
  gap: theme.spacing(1),
  paddingInline: '10px',
  paddingBlock: '8px',
  minHeight: 'auto',
  borderRadius: '6px',
  fontSize: 13,
  color: theme.palette.text.secondary,
  '&:hover': { backgroundColor: theme.palette.background.containerHighest },
  '&.Mui-selected': {
    color: theme.palette.text.primary,
    backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 10%, transparent)`,
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 16%, transparent)`,
    },
  },
}))

// Punto de color del estado en cada ítem.
export const StatusDot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'statusColor',
})<{ statusColor: StatusVariant }>(({ theme, statusColor }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: theme.palette[statusColor].main,
}))

export const ItemLabel = styled('span')({ flexGrow: 1 })
