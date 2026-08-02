import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
          {user ? getInitials(user.name) : <PersonIcon fontSize="small" />}
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
