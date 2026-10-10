import { Box, Button, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import {
  ConfirmDialog,
  DataTable,
  ErrorFallback,
  LoadingSpinner,
  PageWrapper,
  StackedCell,
  StatusBadge,
} from 'shared/components'
import type { DataTableColumn, DataTableTab } from 'shared/components'
import { notify } from 'shared/store'
import { formatRelativeTime, formatInteger } from 'shared/utils'

import { DIRECTION_LABELS, STATUS_LABELS, STATUS_VARIANTS, failedEventsCopy } from '../content'
import {
  NOT_REQUEUEABLE_STATUS,
  QUEUE_TABS,
  useFailedEventAction,
  useFailedEventCounts,
  useFailedEventPage,
} from '../hooks/useFailedEvents'
import type { QueueTabId } from '../hooks/useFailedEvents'
import type { FailedEvent, FailedEventAction } from '../types'
import { actionsFor, eventLabel } from '../utils/actions'

const {
  page,
  tabs: tabCopy,
  columns,
  cells,
  actions: actionCopy,
  discard,
  feedback,
} = failedEventsCopy

const PER_PAGE = 20

function nextRetryCell(event: FailedEvent, now: Date): string {
  if (event.nextRetryAt === null) return cells.noRetry
  if (new Date(event.nextRetryAt).getTime() <= now.getTime()) return cells.due

  return formatRelativeTime(event.nextRetryAt, now) ?? cells.noRetry
}

function lastErrorCell(event: FailedEvent) {
  const status =
    event.lastResponseStatus === null ? undefined : cells.httpStatus(event.lastResponseStatus)

  return <StackedCell primary={event.lastError ?? cells.noError} secondary={status} />
}

/**
 * Cola de eventos fallidos (Dead Letter Queue, RF-16): lo que el motor de
 * reintentos todavía intenta, lo que agotó sus intentos y lo que se resolvió.
 *
 * No tiene maqueta en `docs/design/`: es la tabla del DS con las pestañas por
 * estado del catálogo. Existe para que la resiliencia del sistema se pueda ver
 * y operar, no sólo confiar en que pasa.
 */
export function FailedEventsPage() {
  const [tabId, setTabId] = useState<QueueTabId>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [discarding, setDiscarding] = useState<FailedEvent | undefined>(undefined)

  const status = QUEUE_TABS.find((tab) => tab.id === tabId)?.status
  const events = useFailedEventPage({ page: pageNumber, perPage: PER_PAGE, status })
  const counts = useFailedEventCounts()
  const action = useFailedEventAction()

  // Un solo "ahora" por lectura de la API: el de cuando llegaron los datos. Sin
  // esto cada celda calcularía el suyo, y un re-render cualquiera movería los
  // "en 3 minutos" sin que la tabla haya cambiado.
  const fetchedAt = events.dataUpdatedAt
  const now = useMemo(() => new Date(fetchedAt), [fetchedAt])

  function run(event: FailedEvent, kind: FailedEventAction) {
    action.mutate(
      { id: event.id, action: kind },
      {
        onSuccess: () =>
          notify(kind === 'retry' ? feedback.retried : feedback.discarded, 'success'),
        onError: (error) =>
          notify(
            error.status === NOT_REQUEUEABLE_STATUS ? feedback.notRequeueable : feedback.failed,
            error.status === NOT_REQUEUEABLE_STATUS ? 'info' : 'error',
          ),
        onSettled: () => setDiscarding(undefined),
      },
    )
  }

  // Debajo de `md` (el proyector de 800×600) quedan el evento, su estado y lo
  // que se puede hacer con él. Los intentos, el próximo reintento y la fecha
  // son contexto; el último error es un texto libre en una sola línea que, sin
  // espacio, se llevaba puesta la columna de acciones.
  const tableColumns: DataTableColumn<FailedEvent>[] = [
    {
      id: 'event',
      header: columns.event,
      render: (event) => (
        <StackedCell primary={eventLabel(event)} secondary={DIRECTION_LABELS[event.direction]} />
      ),
    },
    {
      id: 'status',
      header: columns.status,
      width: 140,
      render: (event) => (
        <StatusBadge status={STATUS_VARIANTS[event.status]} label={STATUS_LABELS[event.status]} />
      ),
    },
    {
      id: 'attempts',
      header: columns.attempts,
      align: 'right',
      width: 110,
      hideBelow: 'md',
      render: (event) => cells.attempts(event.attempts, event.maxAttempts),
    },
    {
      id: 'nextRetry',
      header: columns.nextRetry,
      width: 170,
      hideBelow: 'md',
      render: (event) => nextRetryCell(event, now),
    },
    { id: 'lastError', header: columns.lastError, hideBelow: 'md', render: lastErrorCell },
    {
      id: 'createdAt',
      header: columns.createdAt,
      width: 150,
      hideBelow: 'md',
      render: (event) => formatRelativeTime(event.createdAt, now) ?? cells.noRetry,
    },
    {
      id: 'actions',
      header: columns.actions,
      align: 'right',
      width: 220,
      pinned: true,
      // Botones visibles y no el menú de acciones del DataTable: ese menú no
      // admite opciones por fila, y acá cada estado acepta cosas distintas.
      render: (event) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          {actionsFor(event.status).includes('discard') ? (
            <Button
              size="small"
              color="neutral"
              variant="text"
              aria-label={actionCopy.discardFor(event.id)}
              disabled={action.isPending}
              onClick={() => setDiscarding(event)}
            >
              {actionCopy.discard}
            </Button>
          ) : null}
          {actionsFor(event.status).includes('retry') ? (
            <Button
              size="small"
              variant="outlined"
              aria-label={actionCopy.retryFor(event.id)}
              disabled={action.isPending}
              onClick={() => run(event, 'retry')}
            >
              {actionCopy.retry}
            </Button>
          ) : null}
        </Stack>
      ),
    },
  ]

  const tabs: DataTableTab[] = QUEUE_TABS.map(({ id }, index) => {
    const count = counts[index]
    return {
      id,
      label: tabCopy[id],
      ...(count === undefined ? {} : { count: formatInteger(count) }),
    }
  })

  if (events.isPending) return <LoadingSpinner fullScreen />

  if (events.isError) {
    return <ErrorFallback error={events.error} onRetry={() => void events.refetch()} />
  }

  const { total } = events.data
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  const from = total === 0 ? 0 : (pageNumber - 1) * PER_PAGE + 1
  const to = Math.min(pageNumber * PER_PAGE, total)

  return (
    <PageWrapper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" component="h1">
          {page.title}
        </Typography>
        <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
          {page.subtitle}
        </Typography>
      </Box>

      <DataTable
        columns={tableColumns}
        rows={events.data.events}
        getRowId={(event) => event.id}
        label={page.tableLabel}
        tabs={tabs}
        activeTabId={tabId}
        onTabChange={(next) => {
          setTabId(next as QueueTabId)
          setPageNumber(1)
        }}
        rowTone={(event) => (event.status === 'dead' ? 'critical' : 'default')}
        pagination={{
          page: pageNumber,
          pageCount,
          summary: failedEventsCopy.pagination.summary(from, to, total),
          onPageChange: setPageNumber,
        }}
        paginationLabels={{
          previousLabel: failedEventsCopy.pagination.previous,
          nextLabel: failedEventsCopy.pagination.next,
          pageLabel: failedEventsCopy.pagination.page,
        }}
        emptyMessage={page.empty}
      />

      <ConfirmDialog
        open={discarding !== undefined}
        tone="destructive"
        title={discard.title}
        description={discarding === undefined ? undefined : discard.body(eventLabel(discarding))}
        confirmLabel={discard.confirm}
        cancelLabel={discard.cancel}
        closeLabel={discard.close}
        busy={action.isPending}
        onConfirm={() => {
          if (discarding !== undefined) run(discarding, 'discard')
        }}
        onClose={() => setDiscarding(undefined)}
      />
    </PageWrapper>
  )
}
