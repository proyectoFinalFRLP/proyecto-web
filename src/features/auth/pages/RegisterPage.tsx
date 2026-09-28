import { zodResolver } from '@hookform/resolvers/zod'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useAuthStore, useTenantName } from 'shared/store'
import { z } from 'zod'

import { AuthShell } from '../components/AuthShell'
import { AuthCard, BrandMark } from '../components/AuthShell.styles'
import { authContent } from '../content'
import { registerErrorMessage, useRegister } from '../hooks/useRegister'

const { register: registerCopy, errors: errorCopy } = authContent

// El mínimo de la contraseña es el de Devise (`config.password_length = 6..128`):
// validarlo acá evita un viaje al servidor para que responda lo mismo. El máximo
// no se replica — una contraseña de 128 caracteres no es un error que se tipee
// sin querer, y el 422 del backend lo explica si pasa.
const MIN_PASSWORD_LENGTH = 6

const schema = z
  .object({
    email: z.string().min(1, errorCopy.emailRequired).email(errorCopy.emailInvalid),
    password: z
      .string()
      .min(1, errorCopy.passwordRequired)
      .min(MIN_PASSWORD_LENGTH, errorCopy.passwordTooShort),
    passwordConfirmation: z.string().min(1, errorCopy.passwordConfirmationRequired),
    // El check está en S02. No viaja a la API —no hay dónde registrarlo— pero
    // frena el envío, que es lo que la pantalla promete.
    terms: z.literal(true, { message: errorCopy.termsRequired }),
  })
  // El campo del error es la confirmación y no la contraseña: el mensaje tiene
  // que aparecer debajo del campo que hay que corregir.
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: errorCopy.passwordMismatch,
  })

type RegisterFormData = z.infer<typeof schema>

/**
 * Alta de cuenta — S02-Registro (TESIS-135).
 *
 * Crear la cuenta no da sesión: nace sin aprobar y hay que habilitarla desde el
 * backoffice, como dice la bajada del propio diseño. Por eso la pantalla
 * termina en un mensaje y no en una redirección al dashboard.
 *
 * Dos desvíos respecto de S02, los dos porque el dibujo es anterior al backend
 * que existe:
 *
 * - **Sin campo «Usuario».** La tabla `users` no tiene esa columna: la identidad
 *   es el email, y `POST /auth/register` sólo acepta `email` y `password`. Un
 *   campo que no se guarda en ningún lado es peor que su ausencia.
 * - **Los términos no enlazan a ninguna parte.** El texto del check es el del
 *   diseño, pero las páginas legales todavía no existen en la app; se sigue el
 *   mismo criterio que en `AuthShell` con el «Centro de ayuda».
 *
 * La empresa sale del slug que el cliente manda por header; no hay ningún
 * campo de tenant en el formulario.
 */
export function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const tenantName = useTenantName()
  const { mutate, isPending, isSuccess, error } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) })

  // Con sesión abierta pedir acceso no tiene sentido, igual que el login.
  if (isAuthenticated) return <Navigate to="/" replace />

  const requestError = registerErrorMessage(error)

  if (isSuccess) {
    return (
      <AuthShell>
        <AuthCard>
          <Stack spacing={2} alignItems="center">
            <BrandMark>
              <MarkEmailReadOutlinedIcon />
            </BrandMark>
            <Typography variant="h2" color="primary.main">
              {registerCopy.sent.title}
            </Typography>
            <Typography variant="bodyLg" color="text.secondary" align="center">
              {registerCopy.sent.body}
            </Typography>
            <Link component={RouterLink} to="/login" variant="bodyMd">
              {registerCopy.sent.backToLogin}
            </Link>
          </Stack>
        </AuthCard>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthCard>
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <BrandMark sx={{ mb: 1 }}>
            <PersonAddAltOutlinedIcon />
          </BrandMark>
          {/* El nombre del tenant manda, como en el login: el portal es el de esa
              empresa, y es a esa empresa a la que se le pide el acceso. */}
          <Typography variant="h2" color="primary.main">
            {tenantName ?? authContent.brand}
          </Typography>
          <Typography variant="bodyLg" color="text.secondary" align="center">
            {registerCopy.subtitle}
          </Typography>
        </Stack>

        {/* `terms` se descarta a propósito: es del formulario, no del contrato. */}
        <form
          onSubmit={handleSubmit(({ email, password }) => mutate({ email, password }))}
          noValidate
        >
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
                {registerCopy.passwordLabel}
              </Typography>
              <TextField
                id="password"
                type="password"
                autoComplete="new-password"
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

            <Stack spacing={1}>
              <Typography
                variant="bodyMd"
                component="label"
                htmlFor="passwordConfirmation"
                color="text.secondary"
              >
                {registerCopy.passwordConfirmationLabel}
              </Typography>
              <TextField
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                fullWidth
                error={Boolean(errors.passwordConfirmation)}
                helperText={errors.passwordConfirmation?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('passwordConfirmation')}
              />
            </Stack>

            <Stack spacing={0}>
              <FormControlLabel
                control={<Checkbox {...register('terms')} />}
                label={
                  <Typography variant="bodyMd" color="text.secondary">
                    {registerCopy.terms}
                  </Typography>
                }
              />
              {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
            </Stack>

            <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
              {isPending ? registerCopy.submitting : registerCopy.submit}
            </Button>

            <Link component={RouterLink} to="/login" variant="bodyMd" align="center">
              {registerCopy.toLogin}
            </Link>
          </Stack>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
