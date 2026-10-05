import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PageWrapper } from 'shared/components'
import { notify, useOrderDraftStore } from 'shared/store'
import type {
  OrderDraftCustomer,
  OrderDraftDestination,
  OrderDraftItem,
  OrderDraftOrigin,
} from 'shared/store'

import { FormSection } from '../components/FormSection'
import { OrderConfirmCard } from '../components/OrderConfirmCard'
import { OrderWizardHeader } from '../components/OrderWizardHeader'
import { QuoteOptionsPanel } from '../components/QuoteOptionsPanel'
import { ordersCopy } from '../content'
import { useConfirmDraftOrder } from '../hooks/useConfirmDraftOrder'
import { useDraftQuotes } from '../hooks/useDraftQuotes'
import { draftSubtotal, draftWeight } from '../utils/draft'
import { formatOrderId } from '../utils/format'
import { toCreateOrderPayload, toDispatchPayload, toDraftQuotePayload } from '../utils/shipping'

const { wizard, carrier } = ordersCopy

// Mismo criterio que los pasos 1 y 2: las rutas se declaran acá porque una
// feature no puede importar el router (architecture.md §3.2).
const CUSTOMER_STEP_PATH = '/orders/new'
const SHIPPING_STEP_PATH = '/orders/new/shipping'
const ORDERS_PATH = '/orders'
const orderPath = (id: number) => `/orders/${id}`

const STEP = 3
const TOTAL_STEPS = 3

/** Lo que se confirma: el borrador completo de los pasos 1 y 2. */
interface ConfirmedDraft {
  customer: OrderDraftCustomer
  items: OrderDraftItem[]
  origin: OrderDraftOrigin
  destination: OrderDraftDestination
  /**
   * Cómo lo recibe el cliente, congelado junto con el resto. Se lee de la
   * copia y no del store: `clearDraft` lo devuelve a su default `true` apenas
   * la orden existe, y leerlo en vivo hacía que una venta de retiro saliera a
   * pedirles precio a los couriers en mitad de la confirmación.
   */
  requiresShipping: boolean
}

/**
 * Paso 3 del alta manual de una orden (S07): cotizar el envío, elegir el
 * operador y confirmar.
 *
 * Al entrar se cotiza el borrador contra todos los operadores, sin crear la
 * orden (`POST /quotes`, TESIS-131). «Confirmar orden» crea la orden, abre su
 * envío y lo despacha con la opción elegida.
 *
 * Apenas la orden existe, el borrador se vacía: si el despacho falla y la
 * pantalla se recarga, lo que hay que evitar es poder crear la misma venta dos
 * veces. Por eso lo que se muestra durante y después de confirmar sale de una
 * copia del borrador tomada al apretar el botón, no del store.
 *
 * La contracara: si el despacho falla, la orden ya existe. Con su envío abierto
 * y `pending`, el detalle de la orden lo puede despachar (TESIS-134), y el error
 * remite ahí. Si ni siquiera se abrió el envío, esta pantalla es el único lugar
 * que lo abre: el error lo dice y el navegador pregunta antes de recargar o
 * cerrar la pestaña.
 */
export function CarrierStepPage() {
  const navigate = useNavigate()

  const customer = useOrderDraftStore((state) => state.customer)
  const items = useOrderDraftStore((state) => state.items)
  const origin = useOrderDraftStore((state) => state.origin)
  const destination = useOrderDraftStore((state) => state.destination)
  const requiresShipping = useOrderDraftStore((state) => state.requiresShipping)
  const clearDraft = useOrderDraftStore((state) => state.clearDraft)

  const [confirmed, setConfirmed] = useState<ConfirmedDraft | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const live = useMemo(
    () =>
      customer !== null && items.length > 0 && origin !== null && destination !== null
        ? { customer, items, origin, destination, requiresShipping }
        : null,
    [customer, items, origin, destination, requiresShipping],
  )
  const draft = confirmed ?? live

  // Con retiro en el local no se cotiza: no hay envío que despachar, así que
  // tampoco hay a quién preguntarle el precio (TESIS-162).
  const payload = useMemo(
    () =>
      draft?.requiresShipping
        ? toDraftQuotePayload(draft.items, draft.origin, draft.destination)
        : null,
    [draft],
  )
  const quotes = useDraftQuotes(payload)
  const confirm = useConfirmDraftOrder({ onOrderCreated: clearDraft })
  const shipmentMissing =
    confirm.createdOrderId !== null && confirm.createdShipmentId === null && !confirm.isSuccess
  useLeaveWarning(shipmentMissing)

  // Sin cliente o sin líneas no hay orden que cotizar; sin origen o destino hay
  // que volver al paso 2. Se llegó por URL, recargando, o se canceló el
  // borrador en otra pestaña.
  if (draft === null) {
    const missingShipping = customer !== null && items.length > 0
    return <Navigate to={missingShipping ? SHIPPING_STEP_PATH : CUSTOMER_STEP_PATH} replace />
  }

  // La opción elegida sólo cuenta si sigue entre las cotizadas: volver a cotizar
  // puede traer otra lista.
  const chosen = quotes.data?.find((quote) => quote.dispatchIntegrationId === selectedId) ?? null
  const createdOrderId = confirm.createdOrderId
  const orderLabel = createdOrderId === null ? '' : formatOrderId(null, createdOrderId)

  function confirmOrder() {
    // Con envío hace falta la opción elegida; con retiro, no hay ninguna.
    if (draft === null || (draft.requiresShipping && chosen === null)) return

    setConfirmed(draft)
    confirm.mutate(
      {
        order: toCreateOrderPayload(
          draft.customer,
          draft.items,
          draft.origin,
          draft.destination,
          draft.requiresShipping,
        ),
        dispatch: chosen === null ? null : toDispatchPayload(chosen, draft.origin.warehouseId),
      },
      {
        onSuccess: (orderId) => {
          const label = formatOrderId(null, orderId)
          notify(
            chosen === null
              ? carrier.confirmedPickup(label)
              : carrier.confirmed(label, chosen.providerName),
            'success',
          )
          void navigate(ORDERS_PATH)
        },
      },
    )
  }

  // En la columna angosta del resumen, «Ver la orden» va debajo del mensaje y no
  // en el costado de la alerta, donde partía el texto en renglones de dos palabras.
  const status = confirm.isError ? (
    <Alert severity="error" variant="outlined">
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <span>
          {createdOrderId === null ? carrier.errors.order : carrier.errors.dispatch(orderLabel)}{' '}
          {confirm.error.message}
        </span>
        {createdOrderId === null ? null : (
          <span>
            {confirm.createdShipmentId === null
              ? carrier.errors.shipmentMissing
              : carrier.errors.dispatchLater}
          </span>
        )}
        {createdOrderId === null ? null : (
          <Button
            color="inherit"
            size="small"
            onClick={() => void navigate(orderPath(createdOrderId))}
          >
            {carrier.errors.viewOrder}
          </Button>
        )}
      </Stack>
    </Alert>
  ) : null

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack spacing={3}>
        <OrderWizardHeader step={STEP} total={TOTAL_STEPS} subtitle={wizard.steps.carrier} />

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            alignItems: 'start',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
          }}
        >
          <FormSection
            icon={
              draft.requiresShipping ? (
                <LocalShippingOutlinedIcon aria-hidden />
              ) : (
                <StorefrontOutlinedIcon aria-hidden />
              )
            }
            title={draft.requiresShipping ? carrier.options.groupLabel : carrier.pickup.title}
          >
            {/* Con retiro en el local no hay nada que cotizar: la venta se
                registra y el cliente la busca (TESIS-162). */}
            {draft.requiresShipping ? (
              <QuoteOptionsPanel
                quotes={quotes}
                selectedId={chosen?.dispatchIntegrationId ?? null}
                disabled={confirm.isPending}
                onSelect={(quote) => setSelectedId(quote.dispatchIntegrationId)}
                onReview={() => void navigate(SHIPPING_STEP_PATH)}
              />
            ) : (
              <Typography variant="bodyMd" color="text.secondary">
                {carrier.pickup.body(draft.origin.name)}
              </Typography>
            )}
          </FormSection>

          <OrderConfirmCard
            subtotal={draftSubtotal(draft.items)}
            shippingCost={chosen?.shippingCost ?? null}
            weight={draftWeight(draft.items)}
            originName={draft.origin.name}
            destinationLabel={carrier.summary.place(
              draft.destination.city,
              draft.destination.province,
              draft.destination.zipCode,
            )}
            canConfirm={(chosen !== null || !draft.requiresShipping) && !confirm.isPending}
            confirming={confirm.isPending}
            confirmLabel={
              createdOrderId === null ? carrier.summary.confirm : carrier.errors.retryDispatch
            }
            onConfirm={confirmOrder}
            // Con la orden creada ya no hay borrador al que volver.
            onBack={createdOrderId === null ? () => void navigate(SHIPPING_STEP_PATH) : undefined}
            status={status}
          />
        </Box>
      </Stack>
    </PageWrapper>
  )
}

/**
 * Pide confirmación al recargar o cerrar la pestaña mientras `active`. Es lo que
 * el navegador permite: el texto del diálogo es el suyo, no uno propio.
 */
function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return undefined

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}
