import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { OrderEditForm } from '../components/OrderEditForm'
import { ordersCopy } from '../content'
import { useOrder, useOrderShipment } from '../hooks/useOrderDetail'
import { formatOrderId } from '../utils/format'

const { detail } = ordersCopy

// Las rutas se registran en `app/router/routes.tsx`, capa que una feature no
// puede importar (architecture.md §3.2): los destinos se declaran acá.
const ORDERS_PATH = '/orders'
const detailPath = (id: number) => `/orders/${id}`

const NOT_FOUND_STATUS = 404

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
 * Modificación de una orden (S09), en `/orders/edit/:orderId` —la ruta a la que
 * ya llevan «Modificar orden» del detalle y «Editar» del listado—.
 *
 * Resuelve la orden con las mismas queries que el detalle (y comparte su caché)
 * y monta el formulario recién cuando la orden está: sus valores iniciales salen
 * de ella.
 *
 * La `key` del formulario cambia sólo cuando el operador pide recargar después
 * de un 412, y recién cuando llegó la orden nueva: así arranca de nuevo con la
 * orden como la dejó el otro operador. No va atada a la versión a propósito:
 * guardar también cambia la versión (el hook invalida y se vuelve a pedir el
 * detalle), y remontar el formulario en ese momento descartaría el callback que
 * lleva al detalle.
 */
export function OrderEditPage() {
  const { orderId } = useParams()

  // Un `:orderId` que no es un entero positivo no llega a la API.
  const parsedId = Number(orderId)
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined

  const order = useOrder(id)
  const shipment = useOrderShipment(id)
  const [reloads, setReloads] = useState(0)

  if (id === undefined || order.error?.status === NOT_FOUND_STATUS) return <NotFound />

  if (order.isPending) return <LoadingSpinner fullScreen />

  if (order.isError) {
    return <ErrorFallback error={new Error(detail.error)} onRetry={() => void order.refetch()} />
  }

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <OrderEditForm
        key={reloads}
        order={order.data}
        orderLabel={formatOrderId(order.data.externalOrderId, order.data.id)}
        shipment={shipment.data}
        ordersPath={ORDERS_PATH}
        detailPath={detailPath(order.data.id)}
        onReload={() => void order.refetch().then(() => setReloads((count) => count + 1))}
      />
    </PageWrapper>
  )
}
