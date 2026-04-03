import { createTheme, type ThemeOptions } from '@mui/material/styles'

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid',
        },
      },
    },
  },
}

const lightOptions: ThemeOptions = {
  ...baseOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    divider: '#e0e0e0',
  },
  components: {
    ...baseOptions.components,
    MuiCard: {
      ...baseOptions.components?.MuiCard,
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
        },
      },
    },
  },
}

const darkOptions: ThemeOptions = {
  ...baseOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    divider: '#333333',
  },
  components: {
    ...baseOptions.components,
    MuiCard: {
      ...baseOptions.components?.MuiCard,
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
      },
    },
  },
}

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme(mode === 'dark' ? darkOptions : lightOptions)
}
