import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchShipmentCount, fetchShipmentPage } from './api'

// Sólo el `data` importa: la frontera no lee headers ni status de estas respuestas.
function respond(data: unknown): AxiosResponse {
  return { data, headers: {} } as AxiosResponse
}

/** Los query params con los que se llamó al endpoint. */
function capture() {
  const sent: Record<string, unknown>[] = []
  vi.spyOn(client, 'get').mockImplementation((_url: string, config?: unknown) => {
    sent.push((config as { params: Record<string, unknown> }).params)

    return Promise.resolve(respond({ data: [], meta: { page: 1, per_page: 20, total: 0 } }))
  })

  return sent
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// El filtro lo hace el backend (TESIS-164): lo que esta capa tiene que
// garantizar es que el término llegue, y que el vacío no.
describe('fetchShipmentPage', () => {
  it('sends the term as the search parameter', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, search: 'AND-9920' })

    expect(sent[0].search).toBe('AND-9920')
  })

  // Un `search=` en blanco ensucia la URL y la clave de caché sin cambiar la
  // respuesta: el backend corta antes de armar la condición.
  it('omits search when there is no term', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, search: '' })

    expect(sent[0]).not.toHaveProperty('search')
  })

  it('keeps the status filter alongside the term', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, status: 'pending', search: 'AND' })

    expect(sent[0]).toMatchObject({ status: 'pending', search: 'AND' })
  })
})

describe('fetchShipmentCount', () => {
  it('counts with the term applied', async () => {
    const sent = capture()
    await fetchShipmentCount('pending', 'AND')

    expect(sent[0]).toMatchObject({ status: 'pending', search: 'AND', per_page: 1 })
  })

  it('omits search when there is no term', async () => {
    const sent = capture()
    await fetchShipmentCount('pending')

    expect(sent[0]).not.toHaveProperty('search')
  })
})
