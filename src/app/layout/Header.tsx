import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { useAuthStore, useUiStore } from 'shared/store'

const LOGOUT_LABEL = 'Cerrar sesión'

export function Header() {
  const { themeMode, toggleTheme, toggleSidebar } = useUiStore()
  const user = useAuthStore((state) => state.user)
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

        {/* El email es lo único que la app sabe del usuario: no viaja en el JWT
            ni lo devuelve el login, se guarda del formulario. */}
        {user ? (
          <Typography variant="bodyMd" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {user.email}
          </Typography>
        ) : null}

        <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>

        {/* No navega: al limpiar la sesión el guard de rutas redirige al login. */}
        <Tooltip title={LOGOUT_LABEL}>
          <IconButton color="inherit" onClick={logout} aria-label={LOGOUT_LABEL}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
