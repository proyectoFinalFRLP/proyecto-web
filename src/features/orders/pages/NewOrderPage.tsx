import { zodResolver } from '@hookform/resolvers/zod'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import { Alert, Button, Stack } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from 'shared/components'
import { useOrderDraftStore } from 'shared/store'

import { CustomerFieldsCard, customerSchema } from '../components/CustomerFieldsCard'
import type { CustomerFormData } from '../components/CustomerFieldsCard'
import { DraftItemsTable } from '../components/DraftItemsTable'
import { DraftSummaryCard } from '../components/DraftSummaryCard'
import { OrderWizardHeader } from '../components/OrderWizardHeader'
import { ProductPicker } from '../components/ProductPicker'
import { ordersCopy } from '../content'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { canProceed, draftSubtotal, draftWeight } from '../utils/draft'
import { formatMoney, formatWeight } from '../utils/format'

const { wizard, draft } = ordersCopy

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá. El del
// paso 2 lo construye TESIS-58; el cableado ya es el definitivo.
const ORDERS_PATH = '/orders'
const SHIPPING_STEP_PATH = '/orders/new/shipping'

const STEP = 1
const TOTAL_STEPS = 3

const EMPTY_CUSTOMER: CustomerFormData = { firstName: '', lastName: '', document: '' }

/**
 * Paso 1 del alta manual de una orden (S05): quién compra y qué se lleva.
 *
 * El formulario del cliente es de React Hook Form y las líneas viven en el
 * `orderDraftStore`: los productos se agregan de a uno y tienen que sobrevivir
 * a cada re-render del formulario, y además los necesita el paso 3. Los datos
 * del cliente entran al store recién al avanzar, validados.
 *
 * «Siguiente» se habilita sólo con el cliente completo y al menos una línea
 * válida (`canProceed`): es el criterio de la card, y también lo que
 * `POST /orders` exige para no responder 422.
 */
export function NewOrderPage() {
  const navigate = useNavigate()

  const customer = useOrderDraftStore((state) => state.customer)
  const items = useOrderDraftStore((state) => state.items)
  const setCustomer = useOrderDraftStore((state) => state.setCustomer)
  const addItem = useOrderDraftStore((state) => state.addItem)
  const updateItem = useOrderDraftStore((state) => state.updateItem)
  const removeItem = useOrderDraftStore((state) => state.removeItem)
  const clearDraft = useOrderDraftStore((state) => state.clearDraft)

  const catalog = useCatalogProducts()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    // `onChange` para que «Siguiente» se encienda mientras se tipea, sin
    // esperar a un submit que todavía no puede ocurrir.
    mode: 'onChange',
    // Volver del paso 2 encuentra el formulario como se lo dejó.
    defaultValues: customer ?? EMPTY_CUSTOMER,
  })

  const addedIds = new Set(items.map((item) => item.productId))

  const next = handleSubmit((data) => {
    setCustomer(data)
    void navigate(SHIPPING_STEP_PATH)
  })

  function cancel() {
    clearDraft()
    void navigate(ORDERS_PATH)
  }

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack spacing={3}>
        <OrderWizardHeader step={STEP} total={TOTAL_STEPS} subtitle={wizard.steps.customer} />

        <CustomerFieldsCard register={register} errors={errors} />

        {catalog.isError ? (
          <Alert
            severity="error"
            variant="outlined"
            action={
              <Button color="inherit" size="small" onClick={() => void catalog.refetch()}>
                {draft.products.retry}
              </Button>
            }
          >
            {draft.products.catalogError}
          </Alert>
        ) : null}

        <DraftItemsTable
          items={items}
          onQuantityChange={(productId, quantity) => updateItem(productId, { quantity })}
          onRemove={removeItem}
          toolbar={
            <ProductPicker
              products={catalog.data ?? []}
              loading={catalog.isPending}
              addedIds={addedIds}
              onAdd={addItem}
            />
          }
        />

        <DraftSummaryCard
          subtotal={formatMoney(draftSubtotal(items))}
          weight={formatWeight(draftWeight(items))}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant="text" color="neutral" startIcon={<CloseIcon />} onClick={cancel}>
            {wizard.cancel}
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={!canProceed(isValid, items)}
            onClick={() => void next()}
            sx={{ ml: 'auto' }}
          >
            {wizard.next(wizard.steps.shipping)}
          </Button>
        </Stack>
      </Stack>
    </PageWrapper>
  )
}
