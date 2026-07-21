import { alpha } from '@mui/material/styles'
import type { Components, Theme } from '@mui/material/styles'

import { inputColors, radius, roleColors, semanticColors } from '../tokens'
import type { ThemeMode } from '../tokens'

// Input relleno del DS: fill recesado + borde outline. Focus = borde accent +
// anillo. Disabled = fill más oscuro + borde punteado. Error = borde error.
export function muiOutlinedInput(mode: ThemeMode): Components<Theme>['MuiOutlinedInput'] {
  const role = roleColors[mode]
  const { fill, fillDisabled, textDisabled } = inputColors[mode]
  const error = mode === 'dark' ? semanticColors.error.baseD : semanticColors.error.baseL

  return {
    styleOverrides: {
      root: {
        borderRadius: radius.base,
        backgroundColor: fill,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: role.outlineVariant },
        '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
          borderColor: role.outlineVariant,
        },
        '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(role.accent, 0.2)}` },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: role.accent,
          borderWidth: 1,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: error },
        '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(error, 0.2)}` },
        '&.Mui-disabled': {
          backgroundColor: fillDisabled,
          '& .MuiOutlinedInput-notchedOutline': {
            borderStyle: 'dashed',
            borderColor: role.outlineVariant,
          },
        },
      },
      input: {
        padding: '10px 14px',
        '&.Mui-disabled': {
          WebkitTextFillColor: textDisabled,
          cursor: 'not-allowed',
        },
      },
    },
  }
}

export function muiTextField(): Components<Theme>['MuiTextField'] {
  return {
    defaultProps: { variant: 'outlined' },
  }
}
