import { Box, CircularProgress, Stack, Typography } from '@mui/material'
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
} as const

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

/**
 * Gate de arranque: nada de la app se monta antes de saber para qué empresa se
 * está sirviendo.
 *
 * Tres salidas posibles (§5 del contrato):
 *
 * - Sin slug resoluble, o `/tenant-config` que responde 404 → pantalla explícita
 *   de tenant desconocido.
 * - Config en vuelo → splash con la identidad mínima derivada del slug, nunca el
 *   tema base genérico.
 * - Config disponible → la app.
 *
 * La config rehidratada de `localStorage` cuenta como disponible, así que un
 * reload no vuelve a pasar por el splash: el request igual sale y actualiza el
 * store si el branding cambió.
 */
export function TenantGate({ children }: { children: ReactNode }) {
  const slug = useTenantStore((state) => state.slug)
  const config = useTenantStore((state) => state.config)
  const { isError } = useTenantConfig()

  if (slug === null || isError) return <UnknownTenant slug={slug} />
  if (!config) return <TenantSplash name={displayNameFromSlug(slug)} />

  return children
}
