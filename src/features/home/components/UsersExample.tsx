import { Alert, Button, Grid, Typography } from '@mui/material'
import { LoadingSpinner } from 'shared/components'

import { useUsers } from '../hooks/useUsers'

import { UserCard } from './UserCard'

export function UsersExample() {
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
