import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LoadingSpinner, PageWrapper } from 'shared/components'
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
import { QuoteOptionList } from '../components/QuoteOptionList'
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
 * La contracara: una vez creada la orden, esta pantalla es el único lugar desde
 * el que se puede despachar su envío (el detalle todavía no lo ofrece). Mientras
 * el despacho no salga, el navegador pregunta antes de recargar o cerrar la
 * pestaña, y el error lo dice.
 */
export function CarrierStepPage() {
  const navigate = useNavigate()

  const customer = useOrderDraftStore((state) => state.customer)
  const items = useOrderDraftStore((state) => state.items)
  const origin = useOrderDraftStore((state) => state.origin)
  const destination = useOrderDraftStore((state) => state.destination)
  const clearDraft = useOrderDraftStore((state) => state.clearDraft)

  const [confirmed, setConfirmed] = useState<ConfirmedDraft | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const live = useMemo(
    () =>
      customer !== null && items.length > 0 && origin !== null && destination !== null
        ? { customer, items, origin, destination }
        : null,
    [customer, items, origin, destination],
  )
  const draft = confirmed ?? live

  const payload = useMemo(
    () =>
      draft === null ? null : toDraftQuotePayload(draft.items, draft.origin, draft.destination),
    [draft],
  )
  const quotes = useDraftQuotes(payload)
  const confirm = useConfirmDraftOrder({ onOrderCreated: clearDraft })
  const dispatchPending = confirm.createdOrderId !== null && !confirm.isSuccess
  useLeaveWarning(dispatchPending)

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
    if (draft === null || chosen === null) return

    setConfirmed(draft)
    confirm.mutate(
      {
        order: toCreateOrderPayload(draft.customer, draft.items, draft.origin, draft.destination),
        dispatch: toDispatchPayload(chosen, draft.origin),
      },
      {
        onSuccess: (orderId) => {
          notify(carrier.confirmed(formatOrderId(null, orderId), chosen.providerName), 'success')
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
        {createdOrderId === null ? null : <span>{carrier.errors.dispatchPending}</span>}
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
            icon={<LocalShippingOutlinedIcon aria-hidden />}
            title={carrier.options.groupLabel}
          >
            <QuotesContent
              quotes={quotes}
              selectedId={chosen?.dispatchIntegrationId ?? null}
              disabled={confirm.isPending}
              onSelect={(quote) => setSelectedId(quote.dispatchIntegrationId)}
              onReview={() => void navigate(SHIPPING_STEP_PATH)}
            />
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
            canConfirm={chosen !== null && !confirm.isPending}
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

interface QuotesContentProps {
  quotes: ReturnType<typeof useDraftQuotes>
  selectedId: number | null
  disabled: boolean
  onSelect: Parameters<typeof QuoteOptionList>[0]['onSelect']
  onReview: () => void
}

// Los estados de la cotización, fuera del cuerpo de la página para que éste se
// lea de un vistazo.
function QuotesContent({ quotes, selectedId, disabled, onSelect, onReview }: QuotesContentProps) {
  const { options: copy } = carrier

  // Consultar a los operadores puede tardar lo que tarda el más lento: la
  // pantalla lo dice en vez de quedarse en blanco.
  if (quotes.isPending) {
    return (
      <Stack spacing={1} role="status" sx={{ alignItems: 'center', py: 4 }}>
        <LoadingSpinner />
        <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
          {copy.loading}
        </Typography>
      </Stack>
    )
  }

  // Un fallo y una lista vacía son dos cosas distintas: el primero es nuestro o
  // de la red, la segunda es que ningún operador contestó a tiempo. Las dos
  // dejan reintentar o volver a revisar origen y destino.
  if (quotes.isError || quotes.data.length === 0) {
    return (
      <Alert
        severity={quotes.isError ? 'error' : 'warning'}
        variant="outlined"
        action={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small" onClick={onReview}>
              {copy.review}
            </Button>
            <Button color="inherit" size="small" onClick={() => void quotes.refetch()}>
              {copy.retry}
            </Button>
          </Stack>
        }
      >
        {quotes.isError ? copy.error : copy.empty}
      </Alert>
    )
  }

  return (
    <QuoteOptionList
      quotes={quotes.data}
      selectedId={selectedId}
      onSelect={onSelect}
      disabled={disabled}
    />
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
