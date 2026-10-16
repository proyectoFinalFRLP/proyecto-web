import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { navRoutes } from 'app/router/routes'
import { NavLink } from 'react-router-dom'

import { SIDEBAR_WIDTH, useSidebar } from './useSidebar'

/**
 * Navegación lateral. En pantallas anchas es un drawer `persistent`: fijo al
 * costado, abierto de entrada, y el contenido se corre para dejarle lugar.
 * Debajo de `lg` es `temporary`: arranca cerrado, la hamburguesa lo abre
 * flotando sobre el contenido con un scrim, y se cierra al elegir una sección,
 * tocar afuera o apretar Escape. Quién decide el modo es `useSidebar`.
 */
export function Sidebar() {
  const { floating, open, close } = useSidebar()

  return (
    <Drawer
      variant={floating ? 'temporary' : 'persistent'}
      open={open}
      // Sólo lo dispara el `temporary` (scrim o Escape); el fijo no tiene modal.
      onClose={close}
      sx={[
        { '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } },
        // Ancho fijo, también cerrada: el drawer reserva su columna en el flex
        // del layout y el contenido la reclama con un margen negativo (ver
        // AppLayout). Condicionar el ancho acá **y** el margen allá descontaba
        // la sidebar dos veces y abría un hueco de 480px.
        //
        // Sólo en el modo fijo: el flotante vive en un portal fuera del flex, y
        // su raíz es el modal que cubre la pantalla —con ancho de 240px, el scrim
        // dejaría sin cubrir todo lo demás—.
        !floating && { width: SIDEBAR_WIDTH, flexShrink: 0 },
      ]}
    >
      <Toolbar />
      <Divider />
      <List>
        {navRoutes.map((route) => (
          <ListItem key={route.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={route.path}
              end
              // Flotando, la sidebar tapa la pantalla a la que se acaba de ir:
              // elegir una sección es también terminar con el panel.
              onClick={floating ? close : undefined}
              sx={{
                '&.active': {
                  bgcolor: 'action.selected',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon>{route.nav.icon}</ListItemIcon>
              <ListItemText primary={route.nav.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}
