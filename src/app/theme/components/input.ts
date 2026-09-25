import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

// Input relleno del DS: fill recesado + borde outline. Focus = borde accent +
// anillo. Disabled = fill más oscuro + borde punteado. Error = borde error.
//
// Los colores salen de `theme.vars`, así cada uno es la variable de su esquema: el
// relleno es `palette.input`, el borde es `divider` (el `outlineVariant` del
// DS), el acento es `secondary.main` (el del tenant) y el error es
// `error.main`.
export function muiOutlinedInput(): Components<Theme>['MuiOutlinedInput'] {
  return {
    styleOverrides: {
      root: ({ theme }) => {
        const { palette } = theme.vars
        const accent = palette.secondary.main

        return {
          borderRadius: radius.base,
          backgroundColor: palette.input.fill,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.divider },
          '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.divider,
          },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.alpha(accent, 0.2)}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: accent,
            borderWidth: 1,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
          '&.Mui-error.Mui-focused': {
            boxShadow: `0 0 0 3px ${theme.alpha(palette.error.main, 0.2)}`,
          },
          '&.Mui-disabled': {
            backgroundColor: palette.input.fillDisabled,
            '& .MuiOutlinedInput-notchedOutline': {
              borderStyle: 'dashed',
              borderColor: palette.divider,
            },
          },
        }
      },
      input: ({ theme }) => ({
        padding: '10px 14px',
        '&.Mui-disabled': {
          WebkitTextFillColor: theme.vars.palette.input.textDisabled,
          cursor: 'not-allowed',
        },
      }),
    },
  }
}

export function muiTextField(): Components<Theme>['MuiTextField'] {
  return {
    defaultProps: { variant: 'outlined' },
  }
}
