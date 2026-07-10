import { Box, Button, Divider, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { PageWrapper } from 'shared/components'

import { UsersExample } from '../components/UsersExample'

export function HomePage() {
  const [showExample, setShowExample] = useState(false)

  return (
    <PageWrapper>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Bienvenido 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Este es el boilerplate base del proyecto. Explorá el código en <code>src/</code> y los ADRs
        en <code>docs/adr/</code> para entender las decisiones de arquitectura.
      </Typography>

      <Button variant="contained" component={RouterLink} to="/design-system" sx={{ mb: 4 }}>
        Ver Design System
      </Button>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Ejemplo: fetch con React Query
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Requiere que la API Rails esté corriendo y <code>VITE_API_URL</code> configurado en{' '}
          <code>.env</code>.
        </Typography>

        {!showExample ? (
          <Button variant="outlined" onClick={() => setShowExample(true)}>
            Cargar usuarios desde la API
          </Button>
        ) : (
          <UsersExample />
        )}
      </Box>
    </PageWrapper>
  )
}
