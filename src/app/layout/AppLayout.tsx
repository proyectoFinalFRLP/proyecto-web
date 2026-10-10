import { Box, Toolbar } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'shared/components'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SIDEBAR_WIDTH, useSidebar } from './useSidebar'

export function AppLayout() {
  const { floating, open } = useSidebar()
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
          // La sidebar fija ya ocupa su ancho como flex item, así que abierta
          // el contenido no necesita margen: empieza justo donde ella termina.
          // Cerrada, el margen negativo recupera la columna que el drawer
          // sigue reservando, y es lo que se anima para que el contenido
          // acompañe al panel en vez de saltar.
          //
          // La flotante no reserva nada —vive en un portal, fuera de este
          // flex— y pasa por encima: el contenido ocupa siempre todo el ancho.
          ml: floating || open ? 0 : `-${SIDEBAR_WIDTH}px`,
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
