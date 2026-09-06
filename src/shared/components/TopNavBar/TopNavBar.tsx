import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppBar, Badge, Box, IconButton, Stack, Toolbar, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'

import { topNavContent } from './content'
import { NavSearch } from './NavSearch'
import { BrandLink, OrganizationName } from './TopNavBar.styles'
import type { TopNavBarProps } from './TopNavBar.types'
import { UserMenu } from './UserMenu'

// Shell de navegación global (brand + búsqueda + acciones + usuario). Fixed,
// full-width y por encima del drawer: intrínseco al componente vía el tema
// (MuiAppBar en app/theme/components/appBar.ts), no configurable por props.
export function TopNavBar({
  brandTo,
  organization,
  onToggleSidebar,
  themeMode,
  onToggleTheme,
  notificationsCount,
  onNotificationsClick,
  settingsTo,
  user,
  onProfileClick,
  onLogout,
}: TopNavBarProps) {
  return (
    <AppBar>
      <Toolbar sx={{ gap: 1 }}>
        {onToggleSidebar ? (
          <IconButton
            edge="start"
            onClick={onToggleSidebar}
            aria-label={topNavContent.toggleSidebarAriaLabel}
            sx={{ color: 'text.secondary' }}
          >
            <MenuIcon />
          </IconButton>
        ) : null}

        <BrandLink to={brandTo}>{topNavContent.brandLabel}</BrandLink>

        {organization ? <OrganizationName>{organization}</OrganizationName> : null}

        <Box sx={{ flexGrow: 1 }} />

        <NavSearch />

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {onToggleTheme ? (
            <Tooltip
              title={
                themeMode === 'light' ? topNavContent.darkModeLabel : topNavContent.lightModeLabel
              }
            >
              <IconButton
                onClick={onToggleTheme}
                aria-label={topNavContent.toggleThemeAriaLabel}
                sx={{ color: 'text.secondary' }}
              >
                {themeMode === 'light' ? (
                  <Brightness4Icon fontSize="small" />
                ) : (
                  <Brightness7Icon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title={topNavContent.notificationsAriaLabel}>
            <IconButton
              onClick={onNotificationsClick}
              aria-label={topNavContent.notificationsAriaLabel}
              sx={{ color: 'text.secondary' }}
            >
              <Badge
                color="error"
                badgeContent={notificationsCount}
                max={9}
                invisible={!notificationsCount}
              >
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {settingsTo ? (
            <Tooltip title={topNavContent.settingsAriaLabel}>
              <IconButton
                component={Link}
                to={settingsTo}
                aria-label={topNavContent.settingsAriaLabel}
                sx={{ color: 'text.secondary' }}
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        <UserMenu user={user} onProfileClick={onProfileClick} onLogout={onLogout} />
      </Toolbar>
    </AppBar>
  )
}
