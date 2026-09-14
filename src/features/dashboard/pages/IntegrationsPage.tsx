import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { PageWrapper } from 'shared/components'

import { IntegrationNodeList } from '../components/IntegrationNodeList'
import { dashboardCopy } from '../content'
import { useInfraHealth } from '../hooks/useInfraHealth'

const { integrationsPage, error: errorCopy } = dashboardCopy

/**
 * Integraciones como sección propia. Vive en la feature `dashboard` porque
 * comparte el hook y el componente con el panel: son la misma fuente de datos
 * vista con dos aires, y partirlo en otra feature sólo obligaría a un import
 * cross-feature de los que la arquitectura prohíbe.
 *
 * La ruta está detrás del feature flag `integrations` del tenant (TESIS-121).
 */
export function IntegrationsPage() {
  const { nodes, reportingNodes, onlineNodes, isLoading, isError, refetch } = useInfraHealth()

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Box>
          <Typography variant="displaySm">{integrationsPage.title}</Typography>
          <Typography variant="bodyLg" color="text.secondary">
            {integrationsPage.subtitle}
          </Typography>
        </Box>

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                {errorCopy.retry}
              </Button>
            }
          >
            {errorCopy.fallback}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <IntegrationNodeList
              nodes={nodes}
              reportingNodes={reportingNodes}
              onlineNodes={onlineNodes}
              loading={isLoading}
            />
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  )
}
