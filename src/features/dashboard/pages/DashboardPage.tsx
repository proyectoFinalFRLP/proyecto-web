import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { PageWrapper, StatCard } from 'shared/components'

import { IntegrationNodeList } from '../components/IntegrationNodeList'
import { dashboardCopy } from '../content'
import { useInfraHealth } from '../hooks/useInfraHealth'

const { infra, error: errorCopy } = dashboardCopy
const healthCopy = infra.health

// `StatCard` recibe el valor ya formateado: el componente del DS no decide
// separadores ni unidades.
const NUMBER_FORMAT = new Intl.NumberFormat('es-AR')

export function DashboardPage() {
  const {
    nodes,
    reportingNodes,
    onlineNodes,
    healthPercentage,
    healthTone,
    isLoading,
    isError,
    refetch,
  } = useInfraHealth()

  // Sin nodos reportando sync, el KPI no tiene numerador ni denominador reales:
  // se muestra "—" en vez de un 0% que se leería como caída total de la
  // infraestructura, o un 100% que afirmaría una salud que nadie verificó.
  const healthValue =
    isLoading || healthPercentage === null
      ? healthCopy.unknownValue
      : `${NUMBER_FORMAT.format(healthPercentage)}%`

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Box>
          <Typography variant="displaySm">{dashboardCopy.pageTitle}</Typography>
          <Typography variant="bodyLg" color="text.secondary">
            {dashboardCopy.pageSubtitle}
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
            {/* Copy propio, no el texto crudo de la API (architecture.md §4.2). */}
            {errorCopy.fallback}
          </Alert>
        ) : null}

        {/* El resto de las métricas del panel (órdenes, envíos, alertas de
            inventario) son TESIS-53, TESIS-55 y TESIS-56, y dependen de
            endpoints que la API todavía no expone. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              label={healthCopy.label}
              value={healthValue}
              icon={<MonitorHeartOutlinedIcon />}
              tone={healthTone}
            />
          </Grid>
        </Grid>

        {/* El diseño lo ubica en la columna lateral de 280px, al lado de la
            tabla de órdenes recientes que trae TESIS-52. Hasta que exista,
            ocupa su tercio y el resto queda libre. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
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
