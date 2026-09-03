import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { PageWrapper, StatCard } from 'shared/components'

import { IntegrationNodeList } from '../components/IntegrationNodeList'
import { dashboardCopy } from '../content'
import { useInfraHealth } from '../hooks/useInfraHealth'
import { useLogisticsKpis } from '../hooks/useLogisticsKpis'

const { metrics, infra, error: errorCopy } = dashboardCopy
const healthCopy = infra.health

// Los KPIs llegan como número y `StatCard` los recibe ya formateados: el
// componente del DS no decide separadores ni unidades.
const NUMBER_FORMAT = new Intl.NumberFormat('es-AR')

export function DashboardPage() {
  const {
    pendingOrders,
    activeShipments,
    isError: isKpisError,
    refetch: refetchKpis,
  } = useLogisticsKpis()

  const {
    nodes,
    reportingNodes,
    onlineNodes,
    healthPercentage,
    healthTone,
    isLoading: isInfraLoading,
    isError: isInfraError,
    refetch: refetchInfra,
  } = useInfraHealth()

  const isError = isKpisError || isInfraError

  const retry = () => {
    refetchKpis()
    refetchInfra()
  }

  // Sin nodos reportando sync, el KPI no tiene numerador ni denominador reales:
  // se muestra "—" en vez de un 0% que se leería como caída total de la
  // infraestructura, o un 100% que afirmaría una salud que nadie verificó.
  const healthValue =
    isInfraLoading || healthPercentage === null
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
              <Button color="inherit" size="small" onClick={retry}>
                {errorCopy.retry}
              </Button>
            }
          >
            {/* Copy propio, no el texto crudo de la API (architecture.md §4.2). */}
            {errorCopy.fallback}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              label={metrics.pendingOrders.label}
              value={NUMBER_FORMAT.format(pendingOrders)}
              icon={<PendingActionsOutlinedIcon />}
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              label={metrics.activeShipments.label}
              value={NUMBER_FORMAT.format(activeShipments)}
              icon={<LocalShippingOutlinedIcon />}
              tone="info"
            />
          </Grid>
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
            tabla de órdenes recientes que trae TESIS-52. Hasta que exista, ocupa
            su tercio y el resto queda libre. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <IntegrationNodeList
              nodes={nodes}
              reportingNodes={reportingNodes}
              onlineNodes={onlineNodes}
              loading={isInfraLoading}
            />
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  )
}
