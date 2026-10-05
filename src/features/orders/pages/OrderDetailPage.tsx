import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import { notify } from 'shared/store'

import { DispatchShipmentDialog } from '../components/DispatchShipmentDialog'
import { InfoPanel } from '../components/InfoPanel'
import type { InfoField } from '../components/InfoPanel'
import { OrderDetailHeader } from '../components/OrderDetailHeader'
import { OrderItemsTable } from '../components/OrderItemsTable'
import { OrderMetrics } from '../components/OrderMetrics'
import type { OrderMetric } from '../components/OrderMetrics'
import { PaymentSummaryCard } from '../components/PaymentSummaryCard'
import { ShipmentLifecycleCard } from '../components/ShipmentLifecycleCard'
import { ShippingLabelField } from '../components/ShippingLabelField'
import { TrackingNumberField } from '../components/TrackingNumberField'
import { formatCount, ordersCopy } from '../content'
import { useCreateOrderShipment } from '../hooks/useCreateOrderShipment'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import type { OrderDetail, Shipment, ShipmentView } from '../types'
import { canOpenShipment, dispatchableShipment } from '../utils/dispatch'
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
const CONFLICT_STATUS = 409

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

/**
 * La acción de la tarjeta del envío. Son dos y excluyentes: abrir el envío
 * cuando la orden no lo tiene (TESIS-141) y despacharlo cuando quedó `pending`
 * (TESIS-134). Van separadas a propósito —el asistente del alta las encadena
 * porque ahí la persona ya eligió courier en el mismo paso—, así que acá lo que
 * sigue a crear el envío es que aparezca «Despachar».
 */
function shipmentAction({
  dispatchable,
  canOpen,
  creating,
  onDispatch,
  onOpen,
}: {
  dispatchable: Shipment | null
  canOpen: boolean
  creating: boolean
  onDispatch: (shipmentId: number) => void
  onOpen: () => void
}): ReactNode {
  if (dispatchable !== null) {
    return (
      <Button
        variant="contained"
        size="small"
        startIcon={<LocalShippingOutlinedIcon />}
        onClick={() => onDispatch(dispatchable.id)}
      >
        {detail.dispatch.action}
      </Button>
    )
  }

  if (!canOpen) return undefined

  return (
    <Button variant="contained" size="small" disabled={creating} onClick={onOpen}>
      {creating ? detail.openShipment.creating : detail.openShipment.action}
    </Button>
  )
}

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
 *
 * Un envío que quedó sin despachar —el despacho del alta falló y la pantalla se
 * cerró— se despacha desde acá (TESIS-134). Y una orden que todavía no tiene
 * envío lo abre desde acá (TESIS-141): hasta entonces el único lugar que lo
 * abría era el paso 3 del alta manual, así que las órdenes que entran por
 * webhook no tenían forma de llegar al circuito logístico.
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
  // El envío que se está despachando, fijado al abrir el diálogo: despachar
  // refresca el detalle, y el diálogo no tiene que desmontarse con el resultado
  // todavía a la vista porque el envío dejó de estar pendiente.
  const [dispatchingId, setDispatchingId] = useState<number | null>(null)
  const openShipment = useCreateOrderShipment()

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
  const dispatchable = dispatchableShipment(order.data.status, shipmentView)
  const canOpen = canOpenShipment(order.data.status, shipmentView)
  const orderLabel = formatOrderId(order.data.externalOrderId, order.data.id)
  // El id suelto y no `order.data.id` dentro del callback: el angostado de los
  // returns de arriba no alcanza adentro de una función, que TypeScript no sabe
  // cuándo se llama.
  const loadedOrderId = order.data.id

  // Un 409 no es un fallo que haya que reintentar: el envío ya existe (lo abrió
  // el asistente, u otra pestaña) y la invalidación de `onSettled` ya lo trae.
  function createShipment() {
    openShipment.mutate(loadedOrderId, {
      onSuccess: () => notify(detail.openShipment.created, 'success'),
      onError: (failure) =>
        failure.status === CONFLICT_STATUS
          ? notify(detail.openShipment.duplicated)
          : notify(detail.openShipment.error, 'error'),
    })
  }

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <OrderDetailHeader
          orderLabel={orderLabel}
          statusLabel={status.label}
          statusVariant={status.variant}
          ordersPath={ORDERS_PATH}
          onModify={() => void navigate(editPath(order.data.id))}
        />

        <OrderMetrics metrics={buildMetrics(order.data, resolved, payment.total)} />

        <Box sx={CONTENT_GRID}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <OrderItemsTable lines={order.data.lines} productPath={productPath} />
            <ShipmentLifecycleCard
              shipment={shipmentView}
              action={shipmentAction({
                dispatchable,
                canOpen,
                creating: openShipment.isPending,
                onDispatch: setDispatchingId,
                onOpen: createShipment,
              })}
            />
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
                  mientras el courier no confirma. La etiqueta sigue el mismo
                  criterio: la emite el courier al despachar (RF-23). */}
              <TrackingNumberField trackingNumber={resolved?.trackingNumber ?? null} />
              <ShippingLabelField shipment={resolved} />
            </InfoPanel>
            <PaymentSummaryCard
              subtotal={formatMoney(payment.subtotal)}
              shipping={payment.shipping === null ? null : formatMoney(payment.shipping)}
              total={formatMoney(payment.total)}
            />
          </Stack>
        </Box>
      </Stack>

      {/* Se monta al abrirlo: los depósitos y la cotización se piden recién
          cuando el operador decide despachar, no en cada visita al detalle. */}
      {dispatchingId === null ? null : (
        <DispatchShipmentDialog
          open
          orderId={order.data.id}
          orderLabel={orderLabel}
          shipmentId={dispatchingId}
          lines={order.data.lines}
          onClose={() => setDispatchingId(null)}
          onDispatched={(carrier) => {
            setDispatchingId(null)
            notify(detail.dispatch.dispatched(carrier), 'success')
          }}
        />
      )}
    </PageWrapper>
  )
}
