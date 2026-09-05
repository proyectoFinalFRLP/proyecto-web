import { zodResolver } from '@hookform/resolvers/zod'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import { Alert, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, useTenantStore } from 'shared/store'
import { z } from 'zod'

import { AuthShell } from '../components/AuthShell'
import { AuthCard, BrandMark } from '../components/AuthShell.styles'
import { authContent } from '../content'
import { loginErrorMessage, useLogin } from '../hooks/useLogin'

const schema = z.object({
  email: z.string().min(1, authContent.errors.emailRequired).email(authContent.errors.emailInvalid),
  password: z.string().min(1, authContent.errors.passwordRequired),
})

type LoginFormData = z.infer<typeof schema>

interface RedirectState {
  from?: string
}

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  // Copy del tenant: si la empresa declaró una bajada en su config, es la que
  // corresponde acá. La genérica queda de fallback.
  const tagline = useTenantStore((state) => state.config?.branding.tagline)
  const location = useLocation()
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) })

  // Con sesión activa esta pantalla no tiene sentido: se vuelve a la ruta que el
  // guard interrumpió, o al inicio.
  if (isAuthenticated) {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  const requestError = loginErrorMessage(error)

  return (
    <AuthShell>
      <AuthCard>
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <BrandMark sx={{ mb: 1 }}>
            <LockOutlinedIcon />
          </BrandMark>
          <Typography variant="bodyLg">{authContent.heading}</Typography>
          <Typography variant="bodyLg" color="text.secondary" align="center">
            {tagline ?? authContent.subtitle}
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit((values) => mutate(values))} noValidate>
          <Stack spacing={3}>
            {requestError ? <Alert severity="error">{requestError}</Alert> : null}

            <Stack spacing={1}>
              <Typography variant="bodyMd" component="label" htmlFor="email" color="text.secondary">
                {authContent.emailLabel}
              </Typography>
              <TextField
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                fullWidth
                placeholder={authContent.emailPlaceholder}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('email')}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography
                variant="bodyMd"
                component="label"
                htmlFor="password"
                color="text.secondary"
              >
                {authContent.passwordLabel}
              </Typography>
              <TextField
                id="password"
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('password')}
              />
            </Stack>

            <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
              {isPending ? authContent.submitting : authContent.submit}
            </Button>
          </Stack>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
