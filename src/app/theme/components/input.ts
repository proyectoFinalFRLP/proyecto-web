import type { Components, Theme } from '@mui/material/styles'

import { radius } from '../tokens'

export function muiOutlinedInput(): Components<Theme>['MuiOutlinedInput'] {
  return {
    styleOverrides: { root: { borderRadius: radius.base } },
  }
}

export function muiTextField(): Components<Theme>['MuiTextField'] {
  return {
    defaultProps: { variant: 'outlined' },
  }
}
