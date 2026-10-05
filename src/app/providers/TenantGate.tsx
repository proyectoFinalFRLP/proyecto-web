import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { displayNameFromSlug } from 'app/theme/branding'
import type { ReactNode } from 'react'
import { useTenantConfig } from 'shared/hooks/useTenantConfig'
import { useTenantStore } from 'shared/store'

const tenantGateContent = {
  loading: 'Preparando tu espacio de trabajo…',
  unknown: {
    title: 'No encontramos esta empresa',
    body: 'La dirección desde la que entraste no corresponde a ninguna empresa configurada. Revisá el enlace o pedíselo a quien administra tu cuenta.',
    // El slug es el subdominio, o sea que ya es público: mostrarlo no filtra
    // nada y es lo único que le sirve a quien tiene que corregir el enlace.
    attempted: (slug: string) => `Identificador buscado: ${slug}`,
  },
  // Cualquier otra falla de `/tenant-config` (la API reiniciándose, un corte de
  // red): no dice nada sobre si la empresa existe, así que no es «no la
  // encontramos».
  unavailable: {
    title: 'No pudimos conectarnos',
    body: 'No logramos cargar la configuración de tu empresa. Revisá tu conexión y volvé a intentar.',
    retry: 'Reintentar',
  },
} as const

/** El único status que dice que el slug no corresponde a una empresa (§3 del contrato). */
const UNKNOWN_TENANT_STATUS = 404

function FullScreen({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        bgcolor: 'background.default',
      }}
    >
      {children}
    </Box>
  )
}

// Splash del arranque. Ya va pintado con la identidad derivada del slug (ver
// ThemeWrapper): el nombre real y el color real llegan con la config.
function TenantSplash({ name }: { name: string }) {
  return (
    <FullScreen>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h1" color="primary.main">
          {name}
        </Typography>
        <CircularProgress />
        <Typography variant="bodyMd" color="text.secondary">
          {tenantGateContent.loading}
        </Typography>
      </Stack>
    </FullScreen>
  )
}

function UnknownTenant({ slug }: { slug: string | null }) {
  return (
    <FullScreen>
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h1">{tenantGateContent.unknown.title}</Typography>
        <Typography variant="bodyLg" color="text.secondary">
          {tenantGateContent.unknown.body}
        </Typography>
        {slug ? (
          <Typography variant="dataMono" color="text.secondary">
            {tenantGateContent.unknown.attempted(slug)}
          </Typography>
        ) : null}
      </Stack>
    </FullScreen>
  )
}

function TenantUnavailable({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) {
  return (
    <FullScreen>
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h1">{tenantGateContent.unavailable.title}</Typography>
        <Typography variant="bodyLg" color="text.secondary">
          {tenantGateContent.unavailable.body}
        </Typography>
        <Button variant="contained" onClick={onRetry} disabled={retrying}>
          {tenantGateContent.unavailable.retry}
        </Button>
      </Stack>
    </FullScreen>
  )
}

/**
 * Gate de arranque: nada de la app se monta antes de saber para qué empresa se
 * está sirviendo.
 *
 * Tres salidas posibles (§5 del contrato):
 *
 * - Sin slug resoluble, o `/tenant-config` que responde 404 → pantalla explícita
 *   de tenant desconocido.
 * - Config disponible (también la guardada) → la app, aunque el request falle.
 * - Cualquier otra falla sin config → pantalla de error con reintento.
 * - Config en vuelo → splash con la identidad mínima derivada del slug, nunca el
 *   tema base genérico.
 *
 * La config rehidratada de `localStorage` cuenta como disponible, así que un
 * reload no vuelve a pasar por el splash: el request igual sale y actualiza el
 * store si el branding cambió.
 */
export function TenantGate({ children }: { children: ReactNode }) {
  const slug = useTenantStore((state) => state.slug)
  const config = useTenantStore((state) => state.config)
  const { error, isError, isFetching, refetch } = useTenantConfig()

  // Sólo el 404 dice que la empresa no existe. Antes cualquier falla —un 500,
  // la red, una respuesta que no valida— tapaba la app entera con «No
  // encontramos esta empresa», incluso con una config válida guardada y sin
  // forma de reintentar (hallazgo de auditoría, TESIS-89).
  if (slug === null || error?.status === UNKNOWN_TENANT_STATUS) return <UnknownTenant slug={slug} />
  // Con la config rehidratada se sigue: el branding guardado es del mismo slug,
  // y la próxima carga lo vuelve a pedir.
  if (config) return children
  if (isError) {
    return <TenantUnavailable retrying={isFetching} onRetry={() => void refetch()} />
  }

  return <TenantSplash name={displayNameFromSlug(slug)} />
}
