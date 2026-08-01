import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from 'shared/store'
import { z } from 'zod'

import { useLogin } from '../hooks/useLogin'

const schema = z.object({
  email: z.string().min(1, 'Ingresá tu email').email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type FormData = z.infer<typeof schema>

interface LocationState {
  from?: string
}

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const { mutate, isPending, isError, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Con sesión activa la pantalla de ingreso no tiene sentido: se vuelve a la
  // ruta que se había pedido antes del redirect, o al inicio.
  if (isAuthenticated) {
    const from = (location.state as LocationState | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1">
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresá con tu cuenta para acceder al panel.
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit((values) => mutate(values))} noValidate>
          <Stack spacing={2}>
            {isError ? <Alert severity="error">{error.message}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" variant="contained" size="large" loading={isPending} fullWidth>
              Ingresar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}
