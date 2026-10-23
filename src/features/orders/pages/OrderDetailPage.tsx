import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import { notify, useTenantName } from 'shared/store'
import { formatCalendarDate, formatInteger, formatMoney, formatOrderId } from 'shared/utils'

import { DeliveryNote } from '../components/DeliveryNote'
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
import { ordersCopy } from '../content'
import { useCreateOrderShipment } from '../hooks/useCreateOrderShipment'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import type { OrderDetail, Shipment, ShipmentView } from '../types'
import { canOpenShipment, dispatchableShipment } from '../utils/dispatch'
import { formatShortDate } from '../utils/format'
import { paymentSummary, totalUnits } from '../utils/payment'
import { deliveredAt, headerStatus, undeliveredReason } from '../utils/shipment'

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
 * Las cuatro métricas del encabezado. Lo que el modelo no registra —el medio de
 * pago— va como aclaración sin dato en vez de rellenarse con un valor
 * plausible.
 */
function buildMetrics(order: OrderDetail, shipment: Shipment | null, total: number): OrderMetric[] {
  const { metrics } = detail
  const courier = shipment?.courier ?? null

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
      value: formatInteger(totalUnits(order.lines)),
      note: metrics.lines(order.lines.length),
      icon: <Inventory2OutlinedIcon />,
    },
    carrierMetric(order, courier),
    deliveryMetric(shipment),
  ]
}

/**
 * La entrega: el día en que llegó, si ya llegó; si no, el que se le prometió al
 * cliente, con el chip de demora cuando ya pasó. Lo que decide la demora es la
 * API (`delayed`), no una cuenta con el reloj del navegador.
 *
 * Devuelto o cancelado no va a llegar: se dice eso y no la fecha, que ya no
 * promete nada, ni la demora, que dejó de correr.
 */
function deliveryMetric(shipment: Shipment | null): OrderMetric {
  const { metrics } = detail
  const base = { id: 'delivery', label: metrics.delivery, icon: <CalendarTodayOutlinedIcon /> }
  const delivered = shipment === null ? null : deliveredAt(shipment)
  const promised = shipment?.promisedDeliveryOn ?? null
  const undelivered = shipment === null ? null : undeliveredReason(shipment.status)

  if (undelivered !== null) {
    return { ...base, value: detail.undelivered.value, note: undelivered }
  }

  if (delivered !== null) {
    return { ...base, value: formatShortDate(delivered), note: metrics.delivered }
  }

  if (promised === null) {
    return { ...base, value: unknown, note: metrics.noEstimate, unknown: true }
  }

  return {
    ...base,
    value: formatCalendarDate(promised),
    note: metrics.promised,
    tag: shipment?.delayed ? { label: metrics.delayed, tone: 'warning' } : undefined,
  }
}

/**
 * El operador logístico. Una orden de retiro no tiene uno «sin asignar»: no va
 * a tener nunca, y decir que falta mandaba a buscar un despacho que no existe
 * (TESIS-173). Va en el tono neutro igual, porque tampoco es un dato.
 */
function carrierMetric(order: OrderDetail, courier: Shipment['courier']): OrderMetric {
  const { metrics } = detail
  const base = { id: 'carrier', label: metrics.carrier, icon: <LocalShippingOutlinedIcon /> }

  if (!order.requiresShipping) {
    return {
      ...base,
      value: metrics.carrierNotApplicable,
      note: metrics.carrierPickupNote,
      unknown: true,
    }
  }

  return { ...base, value: courier?.name ?? metrics.noCarrier, unknown: courier === null }
}

/** La nota de «no registra contacto» sólo tiene sentido si falta todo el contacto. */
function withoutContact(order: OrderDetail): boolean {
  return order.customerEmail === null && order.customerPhone === null
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
    {
      id: 'contact',
      label: fields.contact,
      value: order.customerEmail ?? unknown,
      unknown: order.customerEmail === null,
    },
    {
      id: 'phone',
      label: fields.phone,
      value: order.customerPhone ?? unknown,
      mono: order.customerPhone !== null,
      unknown: order.customerPhone === null,
    },
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

/** Despachado: salió del estado `pending`, que es cuando el despacho elige el depósito. */
function isDispatched(shipment: Shipment | null): shipment is Shipment {
  return shipment !== null && shipment.status !== 'pending'
}

/**
 * El depósito de origen, que guarda el despacho. Antes de despachar no hay uno
 * —lo elige el despacho—, y un envío despachado sin depósito es uno de antes de
 * que se guardara: «—», con la nota al pie que lo explica.
 *
 * «Tipo de servicio» se fue: S08 lo dibuja, pero ningún courier lo informa ni
 * el modelo lo guarda, y un campo siempre en «—» no le decía nada a nadie.
 */
function originField(shipment: Shipment | null): InfoField {
  const { fields, originPending } = detail.shipping
  const base = { id: 'origin', label: fields.origin }
  const origin = shipment?.originWarehouse ?? null

  if (origin !== null) return { ...base, value: origin.name }
  if (!isDispatched(shipment)) return { ...base, value: originPending, unknown: true }
  return { ...base, value: unknown, unknown: true }
}

/**
 * Los campos del panel del envío. La orden de retiro (TESIS-186) va primero
 * cuando el courier la devolvió; si no, la fila no se muestra: no es un dato
 * que falte, es uno que ese courier no tiene. La entrega comprometida sigue el
 * mismo criterio: sin plazo informado no hay fila, y con la fecha vencida lleva
 * el badge de demora. Devuelto o cancelado, la fila dice que no se entrega.
 */
function shippingFields(shipment: Shipment | null): InfoField[] {
  const { fields } = detail.shipping
  const reference = shipment?.externalReference ?? null
  const promised = shipment?.promisedDeliveryOn ?? null
  const undelivered = shipment === null ? null : undeliveredReason(shipment.status)

  return [
    ...(reference === null
      ? []
      : [{ id: 'pickupOrder', label: fields.pickupOrder, value: reference, mono: true }]),
    originField(shipment),
    ...(promised === null
      ? []
      : [
          undelivered !== null
            ? {
                id: 'promised',
                label: fields.promised,
                value: detail.undelivered.summary(undelivered),
              }
            : {
                id: 'promised',
                label: fields.promised,
                value: formatCalendarDate(promised),
                badge: shipment?.delayed
                  ? { status: 'warning' as const, label: detail.shipping.delayed }
                  : undefined,
              },
        ]),
  ]
}

/** La nota al pie sólo cuando hay algo que explicar: un despachado sin depósito. */
function shippingFootnote(shipment: Shipment | null): string | undefined {
  return isDispatched(shipment) && shipment.originWarehouse === null
    ? detail.shipping.originMissingFootnote
    : undefined
}

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
  const companyName = useTenantName()
  // Cuándo se pidió el remito, mientras se imprime. El remito se monta recién
  // ahí: montado siempre, sus textos (el cliente, cada SKU) duplicarían los de
  // la pantalla para el lector de pantalla y para cualquier búsqueda de texto.
  const [printingAt, setPrintingAt] = useState<string | null>(null)

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
  const canOpen = canOpenShipment(order.data.status, shipmentView, order.data.requiresShipping)
  const orderLabel = formatOrderId(
    order.data.externalOrderId,
    order.data.id,
    order.data.externalOrderNumber,
  )
  // El id suelto y no `order.data.id` dentro del callback: el angostado de los
  // returns de arriba no alcanza adentro de una función, que TypeScript no sabe
  // cuándo se llama.
  const loadedOrderId = order.data.id

  // `flushSync` para que el remito esté en el DOM antes de que el navegador
  // arme la hoja. Se desmonta con `afterprint` y no al volver de `print()`: en
  // algunos navegadores esa llamada no bloquea, y desmontarlo en seguida
  // imprimiría la pantalla sin remito.
  function printDeliveryNote() {
    window.addEventListener('afterprint', () => setPrintingAt(null), { once: true })
    flushSync(() => setPrintingAt(new Date().toISOString()))
    window.print()
  }

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
          onPrint={printDeliveryNote}
        />

        <OrderMetrics metrics={buildMetrics(order.data, resolved, payment.total)} />

        <Box sx={CONTENT_GRID}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <OrderItemsTable lines={order.data.lines} productPath={productPath} />
            <ShipmentLifecycleCard
              shipment={shipmentView}
              pickup={!order.data.requiresShipping}
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
              footnote={withoutContact(order.data) ? detail.customer.footnote : undefined}
            />
            {/* En un retiro el panel entero habla de algo que no va a existir:
                decía «Pendiente de despacho» y «Se emite al despachar» de un
                envío que la orden no lleva. No se muestra, y la tarjeta del
                ciclo de vida es la que explica por qué (TESIS-162). */}
            {order.data.requiresShipping ? (
              <InfoPanel
                title={detail.shipping.title}
                icon={<LocalShippingOutlinedIcon aria-hidden />}
                fields={shippingFields(resolved)}
                footnote={shippingFootnote(resolved)}
              >
                {/* Sin envío resuelto el tracking tampoco existe: el panel dice
                    «Pendiente de despacho», que es lo mismo que ve el operador
                    mientras el courier no confirma. La etiqueta sigue el mismo
                    criterio: la emite el courier al despachar (RF-23). */}
                <TrackingNumberField trackingNumber={resolved?.trackingNumber ?? null} />
                <ShippingLabelField shipment={resolved} />
              </InfoPanel>
            ) : null}
            <PaymentSummaryCard
              subtotal={formatMoney(payment.subtotal)}
              shipping={payment.shipping === null ? null : formatMoney(payment.shipping)}
              total={formatMoney(payment.total)}
              pickup={!order.data.requiresShipping}
            />
          </Stack>
        </Box>
      </Stack>

      {printingAt === null ? null : (
        <DeliveryNote
          order={order.data}
          orderLabel={orderLabel}
          companyName={companyName}
          issuedAt={printingAt}
        />
      )}

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
