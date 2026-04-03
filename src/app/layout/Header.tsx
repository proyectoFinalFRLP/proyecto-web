import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, IconButton, Toolbar, Typography, Tooltip } from '@mui/material'
import { useUiStore } from 'shared/store'

export function Header() {
  const { themeMode, toggleTheme, toggleSidebar } = useUiStore()

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
      </Toolbar>
    </AppBar>
  )
}
