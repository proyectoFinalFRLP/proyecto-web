import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useUiStore } from 'shared/store'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

const DRAWER_WIDTH = 240

export function AppLayout() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="div"
        sx={{
          flexGrow: 1,
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
        <Outlet />
      </Box>
    </Box>
  )
}
