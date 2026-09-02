import Inventory2Icon from '@mui/icons-material/Inventory2'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import { Box, Card, CardActionArea, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { PageWrapper } from 'shared/components'
import { useAuthStore } from 'shared/store'

import { homeCopy } from '../content'

const { page, sections, shortcuts, pending, designSystem } = homeCopy

/**
 * Inicio de la sesión.
 *
 * **No es el panel de operación.** Ese es TESIS-53 a TESIS-56 y hoy está
 * bloqueado: no hay endpoints que alimenten KPIs, salud de nodos, capacidad ni
 * actividad reciente. Hasta que existan, esta pantalla muestra sólo lo que la
 * app puede afirmar —quién tiene la sesión abierta y a qué se puede entrar— en
 * vez de tarjetas con números de mentira.
 */
export function HomePage() {
  const email = useAuthStore((state) => state.user?.email)

  return (
    <PageWrapper>
      <Typography variant="h4" fontWeight={700}>
        {page.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
        {page.subtitle}
      </Typography>
      {email !== undefined && (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1.5 }}>
          {page.session(email)}
        </Typography>
      )}

      <Typography variant="overline" color="text.secondary" component="h2" sx={{ mt: 5 }}>
        {sections.shortcuts}
      </Typography>

      <Card variant="outlined" sx={{ mt: 1, maxWidth: 420 }}>
        <CardActionArea component={RouterLink} to="/inventory" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Inventory2Icon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {shortcuts.inventory.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shortcuts.inventory.description}
              </Typography>
            </Box>
          </Stack>
        </CardActionArea>
      </Card>

      <Typography variant="body2" color="text.disabled" sx={{ mt: 3 }}>
        {pending}
      </Typography>

      {/* Herramienta del equipo, no una función del producto: queda accesible
          pero fuera del cuerpo de la pantalla. */}
      <Box sx={{ mt: 6 }}>
        <Link
          component={RouterLink}
          to="/design-system"
          variant="caption"
          color="text.disabled"
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
