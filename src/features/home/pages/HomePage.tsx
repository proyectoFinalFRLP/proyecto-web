import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { Box, Card, CardActionArea, Link, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { PageWrapper } from 'shared/components'
import { useAuthStore } from 'shared/store'

import { homeCopy } from '../content'

const { page, sections, shortcuts, designSystem } = homeCopy

interface Shortcut {
  id: keyof typeof shortcuts
  to: string
  icon: ReactNode
}

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá.
const SHORTCUTS: Shortcut[] = [
  { id: 'dashboard', to: '/dashboard', icon: <InsightsOutlinedIcon color="primary" /> },
  { id: 'newOrder', to: '/orders/new', icon: <AddShoppingCartOutlinedIcon color="primary" /> },
  { id: 'orders', to: '/orders', icon: <ReceiptLongOutlinedIcon color="primary" /> },
  { id: 'inventory', to: '/inventory', icon: <Inventory2Icon color="primary" /> },
  { id: 'reports', to: '/reports', icon: <BarChartOutlinedIcon color="primary" /> },
]

/**
 * Inicio de la sesión: a dónde se puede ir.
 *
 * Es la pantalla a la que lleva el login. Antes decía que el panel de operación
 * «llegaba más adelante» porque no había endpoints; desde TESIS-53 a TESIS-56
 * el panel existe, así que acá se ofrecen accesos a las pantallas del día a
 * día y ninguna métrica: los números viven en el panel.
 */
export function HomePage() {
  const email = useAuthStore((state) => state.user?.email)

  return (
    <PageWrapper>
      <Typography variant="h1" component="h1">
        {page.title}
      </Typography>
      <Typography variant="bodyLg" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {page.subtitle}
      </Typography>
      {email === undefined ? null : (
        <Typography variant="bodyMd" sx={{ color: 'text.secondary', mt: 1.5 }}>
          {page.session(email)}
        </Typography>
      )}

      <Typography variant="labelCaps" color="text.secondary" component="h2" sx={{ mt: 5 }}>
        {sections.shortcuts}
      </Typography>

      <Box
        component="nav"
        aria-label={sections.shortcuts}
        sx={{
          mt: 1.5,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {SHORTCUTS.map(({ id, to, icon }) => (
          <Card key={id} variant="outlined">
            <CardActionArea component={RouterLink} to={to} sx={{ p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                {icon}
                <Box>
                  <Typography
                    variant="bodyLg"
                    component="span"
                    sx={{ fontWeight: 600, display: 'block' }}
                  >
                    {shortcuts[id].label}
                  </Typography>
                  <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
                    {shortcuts[id].description}
                  </Typography>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Herramienta del equipo, no una función del producto: queda accesible
          pero fuera del cuerpo de la pantalla. */}
      <Box sx={{ mt: 6 }}>
        <Link
          component={RouterLink}
          to="/design-system"
          variant="labelSm"
          color="text.secondary"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          {designSystem}
          <NorthEastIcon sx={{ fontSize: 12 }} />
        </Link>
      </Box>
    </PageWrapper>
  )
}
