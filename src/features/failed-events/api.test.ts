import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchFailedEventPage } from './api'

function respond(data: unknown): AxiosResponse {
  return { data, headers: {} } as AxiosResponse
}

const EVENT = {
  id: 57,
  event_type: 'integrations.http_request',
  direction: 'outbound',
  status: 'dead',
  attempts: 5,
  max_attempts: 5,
  next_retry_at: null,
  last_error: 'Webhooks::Replayers::HttpRequest::MissingIntegration: missing',
  last_response_status: null,
  created_at: '2026-10-28T12:00:00Z',
}

function list(event: Record<string, unknown>) {
  return { data: [event], meta: { page: 1, per_page: 20, total: 1 } }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchFailedEventPage', () => {
  it('maps the support code and its message', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(
      respond(
        list({ ...EVENT, error_code: 'INT-013', error_message: 'La conexión está inactiva' }),
      ),
    )

    const { events } = await fetchFailedEventPage({ page: 1, perPage: 20 })

    expect(events[0]).toMatchObject({
      errorCode: 'INT-013',
      errorMessage: 'La conexión está inactiva',
    })
  })

  it('reads a missing code as null, as an API without support codes sends it', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(respond(list(EVENT)))

    const { events } = await fetchFailedEventPage({ page: 1, perPage: 20 })

    expect(events[0].errorCode).toBeNull()
    expect(events[0].errorMessage).toBeNull()
  })
})
