import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

// Alto de cada opción del segmentado (px), tomado del control de S14-Reportes.
const OPTION_HEIGHT = 28

/**
 * Control segmentado del DS (el «Órdenes | Facturación» de la curva de despacho):
 * un canal recesado con el relleno de los inputs, y la opción activa pintada
 * con el primario. MUI base → tema (component-structure.md §3.1).
 */
export function muiToggleButtonGroup(): Components<Theme>['MuiToggleButtonGroup'] {
  return {
    defaultProps: { size: 'small' },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(0.5),
        gap: theme.spacing(0.5),
        borderRadius: radius.base,
        backgroundColor: theme.vars.palette.input.fill,
        border: `1px solid ${theme.vars.palette.divider}`,
      }),
      // El agrupado de MUI dibuja las opciones pegadas y con los radios sólo en
      // los extremos; el DS las separa y redondea cada una.
      grouped: {
        border: 0,
        '&:not(:first-of-type), &:not(:last-of-type)': {
          borderRadius: radius.sm,
          marginLeft: 0,
        },
      },
    },
  }
}

export function muiToggleButton(): Components<Theme>['MuiToggleButton'] {
  return {
    styleOverrides: {
      root: ({ theme }) => ({
        ...theme.typography.labelMd,
        height: OPTION_HEIGHT,
        padding: theme.spacing(0, 1.5),
        borderRadius: radius.sm,
        border: 0,
        textTransform: 'none',
        color: theme.vars.palette.text.secondary,
        transition: theme.transitions.create(['background-color', 'color']),
        '&:hover': {
          backgroundColor: theme.vars.palette.action.hover,
          color: theme.vars.palette.text.primary,
        },
        '&.Mui-selected, &.Mui-selected:hover': {
          backgroundColor: theme.vars.palette.primary.main,
          color: theme.vars.palette.primary.contrastText,
        },
      }),
    },
  }
}
