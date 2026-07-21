import type { Components, Theme } from '@mui/material/styles'

// Mapea las variantes custom del DS a un elemento HTML semántico.
export function muiTypography(): Components<Theme>['MuiTypography'] {
  return {
    defaultProps: {
      variantMapping: {
        displayLg: 'h1',
        displaySm: 'h2',
        bodyLg: 'p',
        bodyMd: 'p',
        labelMd: 'span',
        labelSm: 'span',
        dataMono: 'span',
      },
    },
  }
}
