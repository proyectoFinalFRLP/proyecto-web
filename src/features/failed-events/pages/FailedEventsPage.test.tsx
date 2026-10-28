import { fireEvent, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

// La página lee el orden de la URL (TESIS-184): necesita un router.
function renderPage(url = '/') {
  return renderWithTheme(
    <MemoryRouter initialEntries={[url]}>
      <FailedEventsPage />
    </MemoryRouter>,
  )
}

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
  errorCode: 'ORD-002',
  errorMessage: 'La venta trae un producto sin vincular',
  lastError:
    "Orders::ProcessWebhookOrder::UnmappedProductError: external product '123' is not mapped to any internal product",
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
  errorCode: 'INT-005',
  errorMessage: 'El proveedor no está disponible',
  lastError: 'Integrations::AdapterExecutionError: Mercado Libre responded with HTTP 503',
  lastResponseStatus: 503,
}

const SUCCEEDED: FailedEvent = {
  ...DEAD,
  id: 13,
  status: 'succeeded',
  errorCode: null,
  errorMessage: null,
  lastError: null,
}

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
    renderPage()

    const pending = row('Pedido a un canal o courier')
    expect(pending.getByText('Saliente')).toBeInTheDocument()
    expect(pending.getByText('Pendiente')).toBeInTheDocument()
    expect(pending.getByText('2 / 5')).toBeInTheDocument()
  })

  it('shows the support code and the cause in words, with the reference and HTTP status', () => {
    renderPage()

    const pending = row('El proveedor no está disponible')
    expect(pending.getByText('INT-005')).toBeInTheDocument()
    expect(pending.getByText('Ref. #12 · HTTP 503')).toBeInTheDocument()
  })

  it('keeps the technical text of the error out of the table', () => {
    renderPage()

    expect(screen.queryByText(/AdapterExecutionError/)).toBeNull()
    expect(screen.queryByText(/UnmappedProductError/)).toBeNull()
  })

  it('says when the next automatic retry is due', () => {
    renderPage()

    expect(
      row('El proveedor no está disponible').getByText('dentro de 4 minutos'),
    ).toBeInTheDocument()
  })

  it('shows the count of each tab', () => {
    renderPage()

    expect(screen.getByRole('tab', { name: /Agotados/ })).toHaveTextContent('1')
  })

  it('retries an exhausted event right away', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar el evento 11' }))

    expect(mutate).toHaveBeenCalledWith({ id: 11, action: 'retry' }, expect.anything())
  })

  it('asks before discarding and then discards', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Descartar el evento 12' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Descartar' }),
    )

    expect(mutate).toHaveBeenCalledWith({ id: 12, action: 'discard' }, expect.anything())
  })

  it('offers no action on an event that already went through', () => {
    renderPage()

    expect(screen.queryByRole('button', { name: 'Reintentar el evento 13' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Descartar el evento 13' })).toBeNull()
  })

  it('asks the API for the status of the chosen tab, from the first page', () => {
    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: /Agotados/ }))

    expect(vi.mocked(useFailedEventPage)).toHaveBeenLastCalledWith({
      page: 1,
      perPage: 20,
      status: 'dead',
      sort: null,
    })
  })

  // TESIS-184: el orden sale de la URL y viaja a la API.
  it('asks the API for the sort of the URL', () => {
    renderPage('/?sort=attempts&direction=desc')

    expect(vi.mocked(useFailedEventPage)).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { key: 'attempts', direction: 'desc' } }),
    )
  })

  it('goes back to the first page and sorts when a header is clicked', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Intentos' }))

    expect(vi.mocked(useFailedEventPage)).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, sort: { key: 'attempts', direction: 'desc' } }),
    )
  })
})
