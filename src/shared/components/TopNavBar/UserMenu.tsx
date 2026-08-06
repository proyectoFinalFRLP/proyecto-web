import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useId, useState } from 'react'
import type { MouseEvent } from 'react'

import { topNavContent } from './content'
import { userMenuPaperSx } from './TopNavBar.styles'
import type { TopNavUser } from './TopNavBar.types'

function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

interface UserMenuProps {
  user?: TopNavUser
  onProfileClick?: () => void
  onLogout?: () => void
}

// Avatar (imagen del usuario, con fallback nativo de MUI a los children si
// falla la carga) + menú desplegable con "Mi perfil" / "Cerrar sesión".
export function UserMenu({ user, onProfileClick, onLogout }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const menuId = useId()
  const displayName = user?.name ?? topNavContent.genericUserName

  const close = () => setAnchorEl(null)
  const runAndClose = (action?: () => void) => () => {
    close()
    action?.()
  }
  // Iniciales con fallback: nombre vacío o solo espacios → ícono genérico,
  // no un avatar en blanco.
  const initials = user ? getInitials(user.name) : ''

  return (
    <>
      <IconButton
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={topNavContent.userMenuAriaLabel}
      >
        <Avatar src={user?.avatarUrl} alt={displayName} sx={{ width: 32, height: 32 }}>
          {initials || <PersonIcon fontSize="small" />}
        </Avatar>
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: userMenuPaperSx } }}
      >
        {/* Identidad de la sesión: hasta que exista `GET /me`, el nombre es el
            email tipeado en el login (se muestra como alt del avatar y acá). */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="bodyMd" color="text.primary" noWrap sx={{ maxWidth: 240 }}>
            {displayName}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={runAndClose(onProfileClick)}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{topNavContent.profileLabel}</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={runAndClose(onLogout)}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{topNavContent.logoutLabel}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
