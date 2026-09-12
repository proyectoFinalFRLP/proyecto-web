import { Box, Toolbar } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'shared/components'
import { useUiStore } from 'shared/store'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

const DRAWER_WIDTH = 240

export function AppLayout() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="div"
        sx={{
          flexGrow: 1,
          // Un flex item arranca en `min-width: auto`, o sea que no se puede
          // achicar debajo del ancho intrínseco de su contenido. Con una tabla
          // ancha adentro eso empuja el layout entero y saca el scroll
          // horizontal al nivel del browser, en vez de dejarlo en el
          // componente que scrollea. `minWidth: 0` es lo que habilita a la
          // tabla a resolver su propio desborde.
          minWidth: 0,
          ml: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
