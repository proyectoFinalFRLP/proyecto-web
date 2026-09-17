import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { InfoPanel } from '../components/InfoPanel'
import type { InfoField } from '../components/InfoPanel'
import { OrderDetailHeader } from '../components/OrderDetailHeader'
import { OrderItemsTable } from '../components/OrderItemsTable'
import { OrderMetrics } from '../components/OrderMetrics'
import type { OrderMetric } from '../components/OrderMetrics'
import { PaymentSummaryCard } from '../components/PaymentSummaryCard'
import { ShipmentLifecycleCard } from '../components/ShipmentLifecycleCard'
import { TrackingNumberField } from '../components/TrackingNumberField'
import { formatCount, ordersCopy } from '../content'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import type { OrderDetail, Shipment, ShipmentView } from '../types'
import { formatMoney, formatOrderId, formatShortDate } from '../utils/format'
import { paymentSummary, totalUnits } from '../utils/payment'
import { deliveredAt, headerStatus } from '../utils/shipment'

const { detail } = ordersCopy
const { unknown } = detail

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá.
const ORDERS_PATH = '/orders'
const editPath = (id: number) => `/orders/edit/${id}`
const productPath = (id: number) => `/inventory/${id}`

const NOT_FOUND_STATUS = 404

// La grilla de S08: el cuerpo a la izquierda y una columna de 300px con los
// paneles. En pantallas angostas los paneles bajan debajo del cuerpo.
const CONTENT_GRID = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
  alignItems: 'start',
}

function resolvedShipment(view: ShipmentView): Shipment | null {
  return view.kind === 'single' ? view.shipment : null
}

/**
 * Las cuatro métricas del encabezado. Lo que el modelo no registra —medio de
 * pago, tipo de servicio, fecha comprometida— va como aclaración sin dato en
 * vez de rellenarse con un valor plausible.
 */
function buildMetrics(order: OrderDetail, shipment: Shipment | null, total: number): OrderMetric[] {
  const { metrics } = detail
  const courier = shipment?.courier ?? null
  const delivered = shipment === null ? null : deliveredAt(shipment)

  return [
    {
      id: 'total',
      label: metrics.total,
      value: formatMoney(total),
      note: metrics.paymentMethodUnknown,
      icon: <PaymentsOutlinedIcon />,
    },
    {
      id: 'units',
      label: metrics.units,
      value: formatCount(totalUnits(order.lines)),
      note: metrics.lines(order.lines.length),
      icon: <Inventory2OutlinedIcon />,
    },
    {
      id: 'carrier',
      label: metrics.carrier,
      value: courier?.name ?? metrics.noCarrier,
      note: courier === null ? undefined : metrics.serviceTypeUnknown,
      icon: <LocalShippingOutlinedIcon />,
      unknown: courier === null,
    },
    {
      id: 'delivery',
      label: metrics.delivery,
      value: delivered === null ? unknown : formatShortDate(delivered),
      note: delivered === null ? metrics.noEstimate : metrics.delivered,
      icon: <CalendarTodayOutlinedIcon />,
      unknown: delivered === null,
    },
  ]
}

function customerFields(order: OrderDetail): InfoField[] {
  const { fields, addressValue } = detail.customer

  return [
    { id: 'name', label: fields.name, value: order.customerName },
    {
      id: 'document',
      label: fields.document,
      value: order.customerDocument ?? unknown,
      mono: order.customerDocument !== null,
      unknown: order.customerDocument === null,
    },
    { id: 'contact', label: fields.contact, value: unknown, unknown: true },
    { id: 'phone', label: fields.phone, value: unknown, unknown: true },
    {
      id: 'address',
      label: fields.address,
      value:
        order.customerAddress === null
          ? unknown
          : addressValue(order.customerAddress, order.customerZipCode),
      unknown: order.customerAddress === null,
    },
  ]
}

// El tipo de servicio y el depósito de origen están en S08 pero no en el modelo.
const SHIPPING_FIELDS: InfoField[] = [
  { id: 'serviceType', label: detail.shipping.fields.serviceType, value: unknown, unknown: true },
  { id: 'origin', label: detail.shipping.fields.origin, value: unknown, unknown: true },
]

function NotFound() {
  return (
    <PageWrapper>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="bodyLg">{detail.notFound}</Typography>
        <Button component={Link} to={ORDERS_PATH} variant="outlined">
          {detail.backToOrders}
        </Button>
      </Stack>
    </PageWrapper>
  )
}

/**
 * Detalle de orden (S08) — líneas, resumen, datos del cliente y ciclo de vida
 * del envío.
 *
 * Los datos salen de dos lugares: la orden con sus líneas de `GET /orders/:id`
 * y el envío con su bitácora de `GET /shipments`. Son queries separadas a
 * propósito: si el envío no se puede leer, la orden se muestra igual.
 */
export function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  // Un `:orderId` que no es un entero positivo no llega a la API: las queries
  // quedan deshabilitadas y la pantalla resuelve en "no encontrada".
  const parsedId = Number(orderId)
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined

  const order = useOrder(id)
  const shipment = useOrderShipment(id)

  if (id === undefined || order.error?.status === NOT_FOUND_STATUS) return <NotFound />

  if (order.isPending) return <LoadingSpinner fullScreen />

  if (order.isError) {
    return <ErrorFallback error={new Error(detail.error)} onRetry={() => void order.refetch()} />
  }

  let shipmentView: ShipmentView = { kind: 'loading' }
  if (shipment.isError) shipmentView = { kind: 'error', onRetry: () => void shipment.refetch() }
  else if (shipment.data !== undefined) shipmentView = shipment.data

  const resolved = resolvedShipment(shipmentView)
  const payment = paymentSummary(order.data, resolved?.shippingCost ?? null)
  const status = headerStatus(order.data.status, shipment.data)

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <OrderDetailHeader
          orderLabel={formatOrderId(order.data.externalOrderId, order.data.id)}
          statusLabel={status.label}
          statusVariant={status.variant}
          ordersPath={ORDERS_PATH}
          onModify={() => void navigate(editPath(order.data.id))}
        />

        <OrderMetrics metrics={buildMetrics(order.data, resolved, payment.total)} />

        <Box sx={CONTENT_GRID}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <OrderItemsTable lines={order.data.lines} productPath={productPath} />
            <ShipmentLifecycleCard shipment={shipmentView} />
          </Stack>

          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
            <InfoPanel
              title={detail.customer.title}
              icon={<PersonOutlineIcon aria-hidden />}
              fields={customerFields(order.data)}
              footnote={detail.customer.footnote}
            />
            <InfoPanel
              title={detail.shipping.title}
              icon={<LocalShippingOutlinedIcon aria-hidden />}
              fields={SHIPPING_FIELDS}
              footnote={detail.shipping.footnote}
            >
              {/* Sin envío resuelto el tracking tampoco existe: el panel dice
                  «Pendiente de despacho», que es lo mismo que ve el operador
                  mientras el courier no confirma. */}
              <TrackingNumberField trackingNumber={resolved?.trackingNumber ?? null} />
            </InfoPanel>
            <PaymentSummaryCard
              subtotal={formatMoney(payment.subtotal)}
              shipping={payment.shipping === null ? null : formatMoney(payment.shipping)}
              total={formatMoney(payment.total)}
            />
          </Stack>
        </Box>
      </Stack>
    </PageWrapper>
  )
}
