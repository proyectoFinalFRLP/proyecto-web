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
import { useUiStore } from 'shared/store'

const DRAWER_WIDTH = 240

export function Sidebar() {
  const { sidebarOpen } = useUiStore()

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        // Ancho fijo, también cerrada: el drawer reserva su columna en el flex
        // del layout y el contenido la reclama con un margen negativo (ver
        // AppLayout). Condicionar el ancho acá **y** el margen allá descontaba
        // la sidebar dos veces y abría un hueco de 480px.
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
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
