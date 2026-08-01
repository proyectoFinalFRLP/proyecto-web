import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, IconButton, Toolbar, Typography, Tooltip } from '@mui/material'
import { useAuthStore, useUiStore } from 'shared/store'

export function Header() {
  const { themeMode, toggleTheme, toggleSidebar } = useUiStore()
  const logout = useAuthStore((state) => state.logout)

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
          aria-label="toggle sidebar"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          proyecto-web
        </Typography>

        <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>

        {/* Al limpiar la sesión, el guard de rutas redirige solo al login. */}
        <Tooltip title="Cerrar sesión">
          <IconButton color="inherit" onClick={logout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
