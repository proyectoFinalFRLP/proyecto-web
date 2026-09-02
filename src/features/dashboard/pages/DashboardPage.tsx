import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { PageWrapper } from 'shared/components'

import { IntegrationNodeList } from '../components/IntegrationNodeList'
import { StatCard } from '../components/StatCard'
import { dashboardCopy } from '../content'
import { useInfraHealth } from '../hooks/useInfraHealth'
import { useLogisticsKpis } from '../hooks/useLogisticsKpis'

const { metrics, infra, error: errorCopy } = dashboardCopy
const healthCopy = infra.health

export function DashboardPage() {
  const {
    pendingOrders,
    totalOrders,
    activeShipments,
    totalShipments,
    isOrdersLoading,
    isShipmentsLoading,
    isError: isKpisError,
    error: kpisError,
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
    error: infraError,
    refetch: refetchInfra,
  } = useInfraHealth()

  const isError = isKpisError || isInfraError
  const error = kpisError ?? infraError

  const retry = () => {
    refetchKpis()
    refetchInfra()
  }

  // Sin ningún nodo reportando sync, el KPI no tiene numerador ni denominador
  // reales: se muestra "—" y el caption explica por qué, en vez de un 0% que se
  // leería como caída total de la infraestructura.
  const healthValue = healthPercentage === null ? healthCopy.unknownValue : `${healthPercentage}%`
  const healthCaption =
    reportingNodes === 0
      ? healthCopy.noReportsCaption
      : healthCopy.caption(onlineNodes, reportingNodes)

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
            {error?.message ?? errorCopy.fallback}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={metrics.pendingOrders.label}
              value={pendingOrders}
              caption={isOrdersLoading ? undefined : metrics.pendingOrders.caption(totalOrders)}
              icon={<PendingActionsOutlinedIcon />}
              tone="warning"
              loading={isOrdersLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={metrics.activeShipments.label}
              value={activeShipments}
              caption={
                isShipmentsLoading ? undefined : metrics.activeShipments.caption(totalShipments)
              }
              icon={<LocalShippingOutlinedIcon />}
              tone="info"
              loading={isShipmentsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={healthCopy.label}
              value={healthValue}
              caption={isInfraLoading ? undefined : healthCaption}
              icon={<HubOutlinedIcon />}
              tone={healthTone}
              loading={isInfraLoading}
            />
          </Grid>
        </Grid>

        <IntegrationNodeList nodes={nodes} loading={isInfraLoading} />
      </Stack>
    </PageWrapper>
  )
}
