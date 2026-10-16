import { zodResolver } from '@hookform/resolvers/zod'
import CloseIcon from '@mui/icons-material/Close'
import { Alert, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from 'shared/components'
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue'
import { useOrderDraftStore } from 'shared/store'
import { formatMoney } from 'shared/utils'

import { CustomerFieldsCard, customerSchema } from '../components/CustomerFieldsCard'
import type { CustomerFormData } from '../components/CustomerFieldsCard'
import { DraftItemsTable } from '../components/DraftItemsTable'
import { DraftSummaryCard } from '../components/DraftSummaryCard'
import { OrderWizardHeader } from '../components/OrderWizardHeader'
import { ProductPicker } from '../components/ProductPicker'
import { WizardNextButton } from '../components/WizardNextButton'
import { ordersCopy } from '../content'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { canProceed, draftSubtotal, draftWeight, itemsGap } from '../utils/draft'
import { formatWeight } from '../utils/format'
import { invalidFields } from '../utils/missing'

const { wizard, draft } = ordersCopy

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá. El del
// paso 2 lo construye TESIS-58; el cableado ya es el definitivo.
const ORDERS_PATH = '/orders'
const SHIPPING_STEP_PATH = '/orders/new/shipping'

const STEP = 1
const TOTAL_STEPS = 3

const EMPTY_CUSTOMER: CustomerFormData = { firstName: '', lastName: '', document: '' }

// El orden en que los nombra «lo que falta»: el de la pantalla.
const CUSTOMER_FIELDS = ['firstName', 'lastName', 'document'] as const

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
 * `POST /orders` exige para no responder 422. Mientras no se puede, debajo
 * dice qué falta (TESIS-173).
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

  // Lo tipeado actualiza el campo en el acto; lo que viaja a la API espera a
  // que la persona deje de escribir. Sin esto el buscador dispara un request
  // por pulsación y descarta casi todos.
  const [search, setSearch] = useState('')
  const catalog = useCatalogProducts(useDebouncedValue(search))

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    // `onChange` para que los errores de un campo aparezcan mientras se tipea,
    // sin esperar a un submit que todavía no puede ocurrir.
    mode: 'onChange',
    // Volver del paso 2 encuentra el formulario como se lo dejó.
    defaultValues: customer ?? EMPTY_CUSTOMER,
  })

  // Lo que falta se calcula sobre lo tipeado, contra el mismo schema, y no
  // sobre `errors`: ésos aparecen recién al tocar un campo, y la lista tiene
  // que nombrar también los que nadie tocó todavía. De la misma cuenta sale si
  // se habilita «Siguiente», en vez del `isValid` del formulario, que llega un
  // render tarde: así el botón y la lista no se contradicen nunca.
  const customerValues = useWatch({ control })
  const missingCustomer = invalidFields(customerSchema, customerValues, CUSTOMER_FIELDS)
  const linesGap = itemsGap(items)
  const gaps = [
    ...missingCustomer.map((field) => draft.missing[field]),
    ...(linesGap === null ? [] : [draft.missing[linesGap]]),
  ]

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
              loading={catalog.isPending || catalog.isFetching}
              addedIds={addedIds}
              onSearchChange={setSearch}
              onAdd={addItem}
            />
          }
        />

        <DraftSummaryCard
          subtotal={formatMoney(draftSubtotal(items))}
          weight={formatWeight(draftWeight(items))}
        />

        {/* `useFlexGap`: sin él `spacing` separa con `margin-left` y pisa el
            `margin-left: auto` que manda el botón de avanzar a la derecha
            (TESIS-132). Por la línea de base y no al centro: debajo de
            «Siguiente» puede ir lo que falta, y centrado contra ese bloque
            «Cancelar» quedaba a media altura del texto (TESIS-173). */}
        <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'baseline' }}>
          <Button variant="text" color="neutral" startIcon={<CloseIcon />} onClick={cancel}>
            {wizard.cancel}
          </Button>
          <WizardNextButton
            label={wizard.next(wizard.steps.shipping)}
            gaps={gaps}
            disabled={!canProceed(missingCustomer.length === 0, items)}
            onClick={() => void next()}
          />
        </Stack>
      </Stack>
    </PageWrapper>
  )
}
