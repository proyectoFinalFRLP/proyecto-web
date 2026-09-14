import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableTab } from 'shared/components'

import { OrdersTable } from '../components/OrdersTable'
import { formatCount, ordersCopy } from '../content'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { ORDER_TABS, useOrderCounts, useOrderPage } from '../hooks/useOrders'
import type { OrderTabId } from '../hooks/useOrders'
import type { OrderSummary } from '../types'

const { page: pageCopy, tabs: tabCopy, pagination } = ordersCopy

const PER_PAGE = 20

/** El copy de cada pestaña, por su id. Las pestañas y su orden viven en `ORDER_TABS`. */
const TAB_LABELS: Record<OrderTabId, string> = {
  all: tabCopy.all,
  pending: tabCopy.pending,
  paid: tabCopy.paid,
  cancelled: tabCopy.cancelled,
}

/**
 * Listado global de órdenes: pestañas por estado, búsqueda y paginación contra
 * `GET /api/v1/orders`.
 *
 * Las tres navegaciones que salen de ací —detalle, edición y alta— apuntan a
 * pantallas que todavía no existen (TESIS-60, TESIS-61 y TESIS-57). El cableado
 * es el definitivo: cuando esas cards entren, funcionan sin tocar este archivo.
 */
export function OrdersPage() {
  const navigate = useNavigate()
  const [tabId, setTabId] = useState<OrderTabId>('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // Lo que se tipea actualiza el campo en el acto; lo que viaja a la API espera
  // a que la persona deje de escribir.
  const debouncedSearch = useDebouncedValue(search)

  const status = ORDER_TABS.find((tab) => tab.id === tabId)?.status
  const orders = useOrderPage({ page, perPage: PER_PAGE, status, search: debouncedSearch })
  const counts = useOrderCounts(debouncedSearch)

  // Cambiar de pestaña o de búsqueda vuelve a la primera página: quedarse en la
  // 7 de un filtro que ahora tiene 2 páginas deja la tabla vacía sin motivo
  // visible.
  function changeTab(nextTabId: string) {
    setTabId(nextTabId as OrderTabId)
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  const tabs: DataTableTab[] = ORDER_TABS.map(({ id }, index) => ({
    id,
    label: TAB_LABELS[id],
    // Un contador que todavía no resolvió no muestra cero: mostraría un número
    // falso durante el primer render y luego saltaría al real.
    count: counts[index] === undefined ? undefined : formatCount(counts[index]),
  }))

  if (orders.isPending) return <LoadingSpinner fullScreen />
  // `onRetry` y no un recargar de página: React Query ya tiene la consulta
  // cacheada con sus filtros, así que reintentar es volver a dispararla.
  if (orders.isError) {
    return <ErrorFallback error={new Error(pageCopy.error)} onRetry={() => void orders.refetch()} />
  }

  const { orders: rows, total } = orders.data
  const pageCount = Math.max(Math.ceil(total / PER_PAGE), 1)
  // Con la tabla vacía el rango arranca en 0 y no en 1: "Mostrando 1 a 0" es
  // una frase rota.
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const to = Math.min(page * PER_PAGE, total)

  function openDetail(order: OrderSummary) {
    void navigate(`/orders/${order.id}`)
  }

  function openEdit(order: OrderSummary) {
    void navigate(`/orders/edit/${order.id}`)
  }

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'flex-start' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {pageCopy.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {pageCopy.subtitle}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ ml: { md: 'auto' }, alignItems: 'center', flexShrink: 0 }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            label={pageCopy.searchLabel}
            placeholder={pageCopy.searchPlaceholder}
            sx={{ width: { xs: '100%', sm: 260 } }}
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void navigate('/orders/new')}
          >
            {pageCopy.create}
          </Button>
        </Stack>
      </Stack>

      <OrdersTable
        orders={rows}
        tabs={tabs}
        activeTabId={tabId}
        onTabChange={changeTab}
        pagination={{
          page,
          pageCount,
          summary: pagination.summary(from, to, total),
          onPageChange: setPage,
        }}
        onView={openDetail}
        onEdit={openEdit}
      />
    </PageWrapper>
  )
}
