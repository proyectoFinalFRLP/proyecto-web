import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { PageWrapper, StatCard } from 'shared/components'

import { IntegrationNodeList } from '../components/IntegrationNodeList'
import { WarehouseLoadCard } from '../components/WarehouseLoadCard'
import { dashboardCopy } from '../content'
import { useInfraHealth } from '../hooks/useInfraHealth'
import { useInventoryAlerts } from '../hooks/useInventoryAlerts'
import { useLogisticsKpis } from '../hooks/useLogisticsKpis'

const { metrics, infra, error: errorCopy } = dashboardCopy
const healthCopy = infra.health
const alertsCopy = metrics.inventoryAlerts

// Destino del click en la tarjeta de alertas. Las rutas se registran en
// `app/router/routes.tsx`, capa que una feature no puede importar
// (architecture.md §3.2), así que el destino se declara acá.
//
// El catálogo no tiene una pestaña que junte los dos estados de alerta, así
// que la tarjeta lleva a la que hay que trabajar primero: si hay productos
// agotados, a ésos —ya no se pueden vender—; si no, a los que están por
// debajo del umbral. Con el inventario sano, al catálogo entero.
const CATALOG_PATH = '/inventory'

function alertsPath(outOfStock: number, low: number): string {
  if (outOfStock > 0) return `${CATALOG_PATH}?tab=out_of_stock`
  if (low > 0) return `${CATALOG_PATH}?tab=low`

  return CATALOG_PATH
}

// La tarjeta entera es el enlace: un ancla y no un onClick, así el foco, el
// Enter y el "abrir en pestaña nueva" salen del navegador y no hay que
// reimplementarlos.
const CARD_LINK = {
  display: 'block',
  height: '100%',
  textDecoration: 'none',
  borderRadius: 3,
  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
}

// `StatCard` recibe el valor ya formateado: el componente del DS no decide
// separadores ni unidades.
const NUMBER_FORMAT = new Intl.NumberFormat('es-AR')

// Un conteo que no llegó (consulta fallida) se muestra como "—", nunca como 0:
// un cero es un dato real —no hay órdenes pendientes— y acá no lo sabemos.
function formatCount(count: number | undefined): string {
  return count === undefined ? metrics.unknownValue : NUMBER_FORMAT.format(count)
}

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

  const {
    alerts,
    breakdown,
    warehouses,
    storedUnits,
    warehousesLoading,
    isError: isInventoryError,
    refetch: refetchInventory,
  } = useInventoryAlerts()

  const isError = isKpisError || isInfraError || isInventoryError

  const retry = () => {
    refetchKpis()
    refetchInfra()
    refetchInventory()
  }

  // El tono de alerta se enciende sólo si hay algo que alertar: con cero
  // productos por debajo del umbral, el borde rojo y el chip «Crítico»
  // afirmarían un problema inexistente. Mientras el número viaja tampoco se
  // enciende: `undefined` no es cero.
  const hasAlerts = alerts.value !== undefined && alerts.value > 0
  const alertsValue = formatCount(alerts.value)

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

        {/* Fila de métricas de S03-Panel, en su orden y con su grilla de cuatro
            columnas. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={metrics.activeShipments.label}
              value={formatCount(activeShipments.value)}
              loading={activeShipments.isLoading}
              icon={<LocalShippingOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={metrics.pendingOrders.label}
              value={formatCount(pendingOrders.value)}
              loading={pendingOrders.isLoading}
              icon={<ScheduleOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label={healthCopy.label}
              value={healthValue}
              icon={<MonitorHeartOutlinedIcon />}
              tone={healthTone}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              component={RouterLink}
              to={alertsPath(breakdown?.outOfStock ?? 0, breakdown?.low ?? 0)}
              aria-label={alertsCopy.linkLabel(alertsValue, !hasAlerts)}
              sx={CARD_LINK}
            >
              <StatCard
                label={alertsCopy.label}
                value={alertsValue}
                loading={alerts.isLoading}
                icon={<WarningAmberOutlinedIcon />}
                tone={hasAlerts ? 'error' : 'neutral'}
                tag={hasAlerts ? alertsCopy.tag : undefined}
                tagTone="error"
                note={
                  hasAlerts && breakdown
                    ? alertsCopy.note(breakdown.outOfStock, breakdown.low)
                    : alertsCopy.calmNote
                }
              />
            </Box>
          </Grid>
        </Grid>

        {/* La columna lateral de 280px del diseño: integraciones arriba y carga
            de depósitos abajo. A su izquierda va la tabla de órdenes recientes,
            que construye TESIS-56; hasta que exista, la columna ocupa su tercio
            y el resto queda libre. */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <IntegrationNodeList
                nodes={nodes}
                reportingNodes={reportingNodes}
                onlineNodes={onlineNodes}
                loading={isInfraLoading}
              />
              <WarehouseLoadCard
                warehouses={warehouses}
                storedUnits={storedUnits}
                loading={warehousesLoading}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  )
}
