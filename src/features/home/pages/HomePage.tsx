import { useState } from 'react'
import { Grid, Typography, Button, Alert, Divider, Box } from '@mui/material'
import { PageWrapper } from 'shared/components'
import { LoadingSpinner } from 'shared/components/LoadingSpinner'
import { useUsers } from '../hooks/useUsers'
import { UserCard } from '../components/UserCard'

function UsersExample() {
  const { data: users, isLoading, isError, error, refetch } = useUsers()

  if (isLoading) return <LoadingSpinner />

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Reintentar
          </Button>
        }
      >
        {error instanceof Error ? error.message : 'Error al cargar usuarios'}
        {' — ¿Está corriendo la API Rails? Revisá '}
        <code>VITE_API_URL</code> en tu <code>.env</code>
      </Alert>
    )
  }

  if (!users?.length) {
    return <Typography color="text.secondary">No hay usuarios para mostrar.</Typography>
  }

  return (
    <Grid container spacing={2}>
      {users.map((user) => (
        <Grid key={user.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <UserCard user={user} />
        </Grid>
      ))}
    </Grid>
  )
}

export function HomePage() {
  const [showExample, setShowExample] = useState(false)

  return (
    <PageWrapper>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Bienvenido 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Este es el boilerplate base del proyecto. Explorá el código en <code>src/</code> y
        los ADRs en <code>docs/adr/</code> para entender las decisiones de arquitectura.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Ejemplo: fetch con React Query
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Requiere que la API Rails esté corriendo y <code>VITE_API_URL</code> configurado en <code>.env</code>.
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
