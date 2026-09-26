import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import type { ServiceType } from 'shared/api'
import { LoadingSpinner, PageWrapper } from 'shared/components'
import { useIntegrations } from 'shared/hooks/useIntegrations'

import { IntegrationCard } from '../components/IntegrationCard'
import { integrationsCopy } from '../content'

const { page, groups } = integrationsCopy

const GROUP_ORDER: ServiceType[] = ['ecommerce', 'courier']

/**
 * Integraciones: qué proveedores tiene conectados la empresa y en qué estado
 * está cada uno (TESIS-139).
 *
 * Es de sólo lectura. Las credenciales las carga el equipo de OneStock desde el
 * backoffice (ADR-018 del backend): la empresa no maneja client secrets ni
 * dominios técnicos que usa una sola vez.
 *
 * La ruta está detrás del feature flag `integrations` del tenant (TESIS-121).
 */
export function IntegrationsPage() {
  const { data, isLoading, isError, refetch } = useIntegrations()
  const services = data ?? []

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Box>
          <Typography variant="displaySm">{page.title}</Typography>
          <Typography variant="bodyLg" color="text.secondary">
            {page.subtitle}
          </Typography>
        </Box>

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                {page.retry}
              </Button>
            }
          >
            {page.error}
          </Alert>
        ) : null}

        {isLoading ? <LoadingSpinner /> : null}

        {!isLoading && !isError && services.length === 0 ? (
          <Typography variant="bodyMd" color="text.secondary">
            {page.empty}
          </Typography>
        ) : null}

        {GROUP_ORDER.map((type) => {
          const group = services.filter((service) => service.type === type)
          if (group.length === 0) return null

          return (
            <Stack key={type} spacing={2} component="section" aria-label={groups[type]}>
              <Typography variant="h2">{groups[type]}</Typography>
              <Grid container spacing={2}>
                {group.map((service) => (
                  <Grid key={service.serviceId} size={{ xs: 12, md: 6, lg: 4 }}>
                    <IntegrationCard service={service} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )
        })}
      </Stack>
    </PageWrapper>
  )
}
