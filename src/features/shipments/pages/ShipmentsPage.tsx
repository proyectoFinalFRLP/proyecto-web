import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableTab } from 'shared/components'

import { ShipmentsTable } from '../components/ShipmentsTable'
import { formatCount, shipmentsCopy } from '../content'
import { SHIPMENT_TABS, useShipmentCounts, useShipmentPage } from '../hooks/useShipments'
import type { ShipmentTabId } from '../hooks/useShipments'
import type { ShipmentSummary } from '../types'

const { page: pageCopy, tabs: tabCopy, pagination } = shipmentsCopy

const PER_PAGE = 20

// El destino se declara acá: las rutas viven en `app/router`, capa que una
// feature no puede importar (architecture.md §3.2).
const orderPath = (id: number) => `/orders/${id}`

/** El copy de cada pestaña, por su id. Las pestañas y su orden viven en `SHIPMENT_TABS`. */
const TAB_LABELS: Record<ShipmentTabId, string> = {
  all: tabCopy.all,
  pending: tabCopy.pending,
  ready_to_ship: tabCopy.ready_to_ship,
  in_transit: tabCopy.in_transit,
  delivered: tabCopy.delivered,
}

/**
 * Listado de envíos: pestañas por estado y paginación contra
 * `GET /api/v1/shipments` (TESIS-163).
 *
 * El endpoint existe paginado y filtrado desde TESIS-113 y hasta ahora lo
 * consumían sólo el KPI del panel y la resolución del envío de una orden.
 *
 * No hay pantalla de detalle del envío y no es un olvido: el ciclo de vida, la
 * bitácora y la etiqueta viven en el detalle de su orden (S08), que es donde el
 * operador decide algo. Por eso cada fila lleva ahí.
 */
export function ShipmentsPage() {
  const navigate = useNavigate()
  const [tabId, setTabId] = useState<ShipmentTabId>('all')
  const [page, setPage] = useState(1)

  const status = SHIPMENT_TABS.find((tab) => tab.id === tabId)?.status
  const shipments = useShipmentPage({ page, perPage: PER_PAGE, status })
  const counts = useShipmentCounts()

  // Cambiar de pestaña vuelve a la primera página: quedarse en la 7 de un
  // filtro que ahora tiene 2 páginas deja la tabla vacía sin motivo visible.
  function changeTab(nextTabId: string) {
    setTabId(nextTabId as ShipmentTabId)
    setPage(1)
  }

  const tabs: DataTableTab[] = SHIPMENT_TABS.map(({ id }, index) => ({
    id,
    label: TAB_LABELS[id],
    // Un contador que todavía no resolvió no muestra cero: mostraría un número
    // falso durante el primer render y luego saltaría al real.
    count: counts[index] === undefined ? undefined : formatCount(counts[index]),
  }))

  if (shipments.isPending) return <LoadingSpinner fullScreen />
  // `onRetry` y no un recargar de página: React Query ya tiene la consulta
  // cacheada con sus filtros, así que reintentar es volver a dispararla.
  if (shipments.isError) {
    return (
      <ErrorFallback error={new Error(pageCopy.error)} onRetry={() => void shipments.refetch()} />
    )
  }

  const { shipments: rows, total } = shipments.data
  const pageCount = Math.max(Math.ceil(total / PER_PAGE), 1)
  // Con la tabla vacía el rango arranca en 0 y no en 1: «Mostrando 1 a 0» es
  // una frase rota.
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const to = Math.min(page * PER_PAGE, total)

  function openOrder(shipment: ShipmentSummary) {
    void navigate(orderPath(shipment.orderId))
  }

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1" component="h1">
            {pageCopy.title}
          </Typography>
          <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
            {pageCopy.subtitle}
          </Typography>
        </Box>

        <ShipmentsTable
          shipments={rows}
          tabs={tabs}
          activeTabId={tabId}
          onTabChange={changeTab}
          onView={openOrder}
          pagination={{
            page,
            pageCount,
            summary: pagination.summary(from, to, total),
            onPageChange: setPage,
          }}
        />
      </Stack>
    </PageWrapper>
  )
}
