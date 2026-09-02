import type { Components, Theme } from '@mui/material/styles'

// AppBar único de la app (TopNavBar): superficie `background.paper`, borde
// inferior `divider`, siempre fixed y por encima del drawer (ver
// docs/guidelines component-structure.md §3.1 — MUI base → tema).
export function muiAppBar(): Components<Theme>['MuiAppBar'] {
  return {
    defaultProps: { position: 'fixed', color: 'transparent', elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }),
    },
  }
}
