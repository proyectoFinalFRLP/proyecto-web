import SearchIcon from '@mui/icons-material/Search'
import { Box, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableTab } from 'shared/components'
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue'
import { sortResetKey, usePageNumber } from 'shared/hooks/usePageNumber'
import { useSortParam } from 'shared/hooks/useSortParam'
import { formatInteger } from 'shared/utils'

import { ShipmentsTable } from '../components/ShipmentsTable'
import { shipmentsCopy } from '../content'
import { SHIPMENT_TABS, useShipmentCounts, useShipmentPage } from '../hooks/useShipments'
import type { ShipmentTabId } from '../hooks/useShipments'
import type { ShipmentSummary } from '../types'
import { SHIPMENT_SORT_KEYS } from '../utils/sort'

const { page: pageCopy, tabs: tabCopy, table, pagination, delayedFilter } = shipmentsCopy

const PER_PAGE = 20

// `?delayed=true`: el filtro vive en la URL para que otras pantallas puedan
// enlazarlo («Ver bitácora» de Reportes) y para que sobreviva a recargar.
const DELAYED_PARAM = 'delayed'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [tabId, setTabId] = useState<ShipmentTabId>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useSortParam(SHIPMENT_SORT_KEYS)
  // Sólo `true` filtra: cualquier otro valor en la URL se lee como «todos», que
  // es lo que la API haría con él.
  const delayed = searchParams.get(DELAYED_PARAM) === 'true'
  // Otro orden, o poner y sacar el filtro, vuelve a la página 1, venga del
  // encabezado o de la URL.
  const [page, setPage] = usePageNumber(`${sortResetKey(sort)}|${String(delayed)}`)

  // Lo que se tipea actualiza el campo en el acto; lo que viaja a la API espera
  // a que la persona deje de escribir.
  const debouncedSearch = useDebouncedValue(search)

  const status = SHIPMENT_TABS.find((tab) => tab.id === tabId)?.status
  const shipments = useShipmentPage({
    page,
    perPage: PER_PAGE,
    status,
    search: debouncedSearch,
    delayed,
    sort,
  })
  // El término y el filtro también van a los contadores: si no, las pestañas
  // seguirían diciendo cuántos envíos tiene la empresa mientras la tabla
  // muestra tres.
  const counts = useShipmentCounts(debouncedSearch, delayed)

  // Cambiar de pestaña o de búsqueda vuelve a la primera página: quedarse en la
  // 7 de un filtro que ahora tiene 2 páginas deja la tabla vacía sin motivo
  // visible.
  function changeTab(nextTabId: string) {
    setTabId(nextTabId as ShipmentTabId)
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  // Se saca sólo ese parámetro: el orden, que también vive en la URL, queda.
  function clearDelayed() {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        params.delete(DELAYED_PARAM)
        return params
      },
      { replace: true },
    )
  }

  let emptyMessage: string = table.empty
  if (debouncedSearch) emptyMessage = table.emptySearch
  else if (delayed) emptyMessage = table.emptyDelayed

  const tabs: DataTableTab[] = SHIPMENT_TABS.map(({ id }) => ({
    id,
    label: TAB_LABELS[id],
    // Un contador que todavía no resolvió no muestra cero: mostraría un número
    // falso durante el primer render y luego saltaría al real.
    count: counts.data === undefined ? undefined : formatInteger(counts.data[id]),
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
        {/* `useFlexGap`: sin él `spacing` separa con `margin-left` y pisa el
            `ml: 'auto'` que manda el buscador a la derecha (TESIS-132). */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ alignItems: { md: 'flex-start' } }}
        >
          <Box>
            <Typography variant="h1" component="h1">
              {pageCopy.title}
            </Typography>
            <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
              {pageCopy.subtitle}
            </Typography>
          </Box>

          <TextField
            size="small"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            label={pageCopy.searchLabel}
            placeholder={pageCopy.searchPlaceholder}
            sx={{ ml: { md: 'auto' }, width: { xs: '100%', sm: 300 }, flexShrink: 0 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        {/* El filtro se ve y se saca: llega por un enlace, y sin el chip el
            listado parecería tener menos envíos sin decir por qué. */}
        {delayed ? (
          <Box>
            <Chip
              label={delayedFilter.label}
              color="warning"
              variant="outlined"
              aria-label={delayedFilter.clear}
              onClick={clearDelayed}
              onDelete={clearDelayed}
            />
          </Box>
        ) : null}

        <ShipmentsTable
          shipments={rows}
          tabs={tabs}
          activeTabId={tabId}
          onTabChange={changeTab}
          onView={openOrder}
          sort={sort}
          onSortChange={setSort}
          emptyMessage={emptyMessage}
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
