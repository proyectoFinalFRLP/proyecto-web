import { zodResolver } from '@hookform/resolvers/zod'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { LoadingSpinner, PageWrapper } from 'shared/components'
import { useOrderDraftStore } from 'shared/store'

import { DestinationFieldsCard, destinationSchema } from '../components/DestinationFieldsCard'
import type { DestinationFormData } from '../components/DestinationFieldsCard'
import { FormSection } from '../components/FormSection'
import { OrderWizardHeader } from '../components/OrderWizardHeader'
import { OriginWarehousePicker } from '../components/OriginWarehousePicker'
import { ordersCopy } from '../content'
import { useDraftStocks } from '../hooks/useDraftStocks'
import { useOriginWarehouses } from '../hooks/useOriginWarehouses'
import { useProvinces } from '../hooks/useProvinces'
import { warehouseCoverage } from '../utils/shipping'
import type { WarehouseCoverage } from '../utils/shipping'

const { wizard, shipping } = ordersCopy

// Mismo criterio que el paso 1: las rutas se declaran acá porque una feature no
// puede importar el router (architecture.md §3.2). El paso 3 lo construye
// TESIS-59; el cableado ya es el definitivo.
const CUSTOMER_STEP_PATH = '/orders/new'
const CARRIER_STEP_PATH = '/orders/new/carrier'

const STEP = 2
const TOTAL_STEPS = 3

const EMPTY_DESTINATION: DestinationFormData = { address: '', city: '', province: '', zipCode: '' }

/**
 * Paso 2 del alta manual de una orden (S06): de dónde sale la mercadería y a
 * dónde va.
 *
 * El depósito de origen es uno para toda la orden, y sólo se puede elegir uno
 * que tenga stock para todas las líneas del borrador: el paso 3 lo manda como
 * `warehouse_id` de cada línea y el alta descuenta de ahí. Es la validación
 * preventiva que pide la card, hecha acá y no al confirmar, cuando todavía se
 * puede cambiar de depósito o volver a ajustar cantidades.
 *
 * El depósito se guarda en el borrador apenas se elige; el domicilio, al
 * avanzar (validado) o al volver al paso 1 (tal como esté, para no perder lo
 * tipeado).
 */
export function ShippingStepPage() {
  const navigate = useNavigate()

  const customer = useOrderDraftStore((state) => state.customer)
  const items = useOrderDraftStore((state) => state.items)
  const origin = useOrderDraftStore((state) => state.origin)
  const destination = useOrderDraftStore((state) => state.destination)
  const setOrigin = useOrderDraftStore((state) => state.setOrigin)
  const setDestination = useOrderDraftStore((state) => state.setDestination)

  const warehouses = useOriginWarehouses()
  const stocks = useDraftStocks(items.map((item) => item.productId))
  const provinces = useProvinces()

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    mode: 'onChange',
    // Volver del paso 3 (o recargar) encuentra el domicilio como se lo dejó.
    defaultValues: destination ?? EMPTY_DESTINATION,
  })

  // `null` mientras falta algún dato: ningún depósito se puede elegir todavía.
  const coverage = useMemo(() => {
    if (warehouses.data === undefined || stocks.isPending || stocks.isError) return null

    return new Map<number, WarehouseCoverage>(
      warehouses.data.map((warehouse) => [
        warehouse.id,
        warehouseCoverage(warehouse.id, items, stocks.stocks),
      ]),
    )
  }, [warehouses.data, stocks.isPending, stocks.isError, stocks.stocks, items])

  // El depósito guardado sólo cuenta si sigue cubriendo la orden: el operador
  // pudo volver al paso 1 y subir una cantidad que ya no alcanza.
  const selectedId =
    origin !== null && coverage?.get(origin.warehouseId)?.level === 'full'
      ? origin.warehouseId
      : null
  const noneCovers =
    coverage !== null && [...coverage.values()].every((entry) => entry.level !== 'full')

  // Sin cliente o sin líneas no hay orden que despachar: se llegó por URL o se
  // canceló el borrador en otra pestaña.
  if (customer === null || items.length === 0) {
    return <Navigate to={CUSTOMER_STEP_PATH} replace />
  }

  const next = handleSubmit((data) => {
    setDestination(data)
    void navigate(CARRIER_STEP_PATH)
  })

  function back() {
    setDestination(getValues())
    void navigate(CUSTOMER_STEP_PATH)
  }

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack spacing={3}>
        <OrderWizardHeader step={STEP} total={TOTAL_STEPS} subtitle={wizard.steps.shipping} />

        <FormSection icon={<WarehouseOutlinedIcon aria-hidden />} title={shipping.origin.title}>
          <OriginContent
            warehouses={warehouses}
            stocks={stocks}
            coverage={coverage}
            selectedId={selectedId}
            noneCovers={noneCovers}
            onSelect={(warehouse) => setOrigin({ warehouseId: warehouse.id, name: warehouse.name })}
          />
        </FormSection>

        <DestinationFieldsCard
          register={register}
          control={control}
          errors={errors}
          provinces={provinces.data ?? []}
          provincesLoading={provinces.isPending}
          provincesError={provinces.isError}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={back}>
            {shipping.back}
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={!isValid || selectedId === null}
            onClick={() => void next()}
            sx={{ ml: 'auto' }}
          >
            {wizard.next(wizard.steps.carrier)}
          </Button>
        </Stack>
      </Stack>
    </PageWrapper>
  )
}

interface OriginContentProps {
  warehouses: ReturnType<typeof useOriginWarehouses>
  stocks: ReturnType<typeof useDraftStocks>
  coverage: Map<number, WarehouseCoverage> | null
  selectedId: number | null
  noneCovers: boolean
  onSelect: Parameters<typeof OriginWarehousePicker>[0]['onSelect']
}

// Los estados de la sección de origen, fuera del cuerpo de la página para que
// éste se lea de un vistazo.
function OriginContent({
  warehouses,
  stocks,
  coverage,
  selectedId,
  noneCovers,
  onSelect,
}: OriginContentProps) {
  const { origin: copy } = shipping

  if (warehouses.isPending) return <LoadingSpinner />

  if (warehouses.isError) {
    return <RetryAlert message={copy.error} onRetry={() => void warehouses.refetch()} />
  }

  if (warehouses.data.length === 0) {
    return (
      <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
        {copy.empty}
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {stocks.isError ? <RetryAlert message={copy.stockError} onRetry={stocks.refetch} /> : null}
      {noneCovers ? (
        <Alert severity="warning" variant="outlined">
          {copy.noneCovers}
        </Alert>
      ) : null}
      <OriginWarehousePicker
        warehouses={warehouses.data}
        coverage={coverage}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </Stack>
  )
}

function RetryAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {shipping.origin.retry}
        </Button>
      }
    >
      {message}
    </Alert>
  )
}
