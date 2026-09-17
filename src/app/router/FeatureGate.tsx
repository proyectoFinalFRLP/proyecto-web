import { Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import type { TenantFeature } from 'shared/api'
import { PageWrapper } from 'shared/components'
import { useTenantFeature } from 'shared/store'

const featureGateContent = {
  title: 'Esta sección no está disponible',
  body: 'Tu empresa no tiene habilitada esta funcionalidad. Si creés que debería estarlo, hablá con quien administra la cuenta.',
} as const

/**
 * Guard de las rutas que dependen de un feature flag del tenant.
 *
 * El Sidebar ya no lista la ruta cuando la feature está apagada, pero la URL
 * sigue existiendo (un favorito, un enlace pegado). Sin esto la página se
 * montaría y pediría datos que el backend no le va a dar: mejor una pantalla que
 * dice qué pasa que un error de la API o una vista vacía sin explicación.
 */
export function FeatureGate({
  feature,
  children,
}: {
  feature: TenantFeature
  children: ReactNode
}) {
  const enabled = useTenantFeature(feature)

  if (enabled) return children

  return (
    <PageWrapper>
      <Stack spacing={2}>
        <Typography variant="h1">{featureGateContent.title}</Typography>
        <Typography variant="bodyLg" color="text.secondary">
          {featureGateContent.body}
        </Typography>
      </Stack>
    </PageWrapper>
  )
}
