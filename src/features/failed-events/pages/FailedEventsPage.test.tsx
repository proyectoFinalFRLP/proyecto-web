import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import type * as queueHooks from '../hooks/useFailedEvents'
import {
  useFailedEventAction,
  useFailedEventCounts,
  useFailedEventPage,
} from '../hooks/useFailedEvents'
import type { FailedEvent } from '../types'

import { FailedEventsPage } from './FailedEventsPage'

vi.mock('../hooks/useFailedEvents', async (importOriginal) => ({
  ...(await importOriginal<typeof queueHooks>()),
  useFailedEventPage: vi.fn(),
  useFailedEventCounts: vi.fn(),
  useFailedEventAction: vi.fn(),
}))

const FETCHED_AT = new Date('2026-10-02T12:00:00Z').getTime()

const DEAD: FailedEvent = {
  id: 11,
  eventType: 'webhooks.order_ingestion',
  direction: 'inbound',
  status: 'dead',
  attempts: 5,
  maxAttempts: 5,
  nextRetryAt: null,
  lastError: 'product not found for external id 123',
  lastResponseStatus: null,
  createdAt: '2026-10-02T10:00:00Z',
}

const PENDING: FailedEvent = {
  ...DEAD,
  id: 12,
  eventType: 'integrations.http_request',
  direction: 'outbound',
  status: 'pending',
  attempts: 2,
  nextRetryAt: '2026-10-02T12:04:00Z',
  lastError: 'Service Unavailable',
  lastResponseStatus: 503,
}

const SUCCEEDED: FailedEvent = { ...DEAD, id: 13, status: 'succeeded', lastError: null }

const mutate = vi.fn()

function showEvents(events: FailedEvent[]) {
  vi.mocked(useFailedEventPage).mockReturnValue({
    data: { events, page: 1, perPage: 20, total: events.length },
    dataUpdatedAt: FETCHED_AT,
    isPending: false,
    isError: false,
  } as never)
}

beforeEach(() => {
  mutate.mockReset()
  showEvents([DEAD, PENDING, SUCCEEDED])
  vi.mocked(useFailedEventCounts).mockReturnValue([3, 1, 1, 1, 0])
  vi.mocked(useFailedEventAction).mockReturnValue({ mutate, isPending: false } as never)
})

const row = (text: string) => {
  const cell = screen.getAllByText(text)[0]
  const tableRow = cell?.closest('tr')
  if (tableRow === null || tableRow === undefined) throw new Error(`no row for ${text}`)
  return within(tableRow)
}

describe('FailedEventsPage', () => {
  it('names each event in words with its direction, status and attempts', () => {
    renderWithTheme(<FailedEventsPage />)

    const pending = row('Pedido a un canal o courier')
    expect(pending.getByText('Saliente')).toBeInTheDocument()
    expect(pending.getByText('Pendiente')).toBeInTheDocument()
    expect(pending.getByText('2 / 5')).toBeInTheDocument()
  })

  it('shows the last error with the HTTP status of the answer', () => {
    renderWithTheme(<FailedEventsPage />)

    expect(row('Service Unavailable').getByText('HTTP 503')).toBeInTheDocument()
  })

  it('says when the next automatic retry is due', () => {
    renderWithTheme(<FailedEventsPage />)

    expect(row('Service Unavailable').getByText('dentro de 4 minutos')).toBeInTheDocument()
  })

  it('shows the count of each tab', () => {
    renderWithTheme(<FailedEventsPage />)

    expect(screen.getByRole('tab', { name: /Agotados/ })).toHaveTextContent('1')
  })

  it('retries an exhausted event right away', () => {
    renderWithTheme(<FailedEventsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar el evento 11' }))

    expect(mutate).toHaveBeenCalledWith({ id: 11, action: 'retry' }, expect.anything())
  })

  it('asks before discarding and then discards', () => {
    renderWithTheme(<FailedEventsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Descartar el evento 12' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Descartar' }),
    )

    expect(mutate).toHaveBeenCalledWith({ id: 12, action: 'discard' }, expect.anything())
  })

  it('offers no action on an event that already went through', () => {
    renderWithTheme(<FailedEventsPage />)

    expect(screen.queryByRole('button', { name: 'Reintentar el evento 13' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Descartar el evento 13' })).toBeNull()
  })

  it('asks the API for the status of the chosen tab, from the first page', () => {
    renderWithTheme(<FailedEventsPage />)

    fireEvent.click(screen.getByRole('tab', { name: /Agotados/ }))

    expect(vi.mocked(useFailedEventPage)).toHaveBeenLastCalledWith({
      page: 1,
      perPage: 20,
      status: 'dead',
    })
  })
})
