import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { client } from './client'
import { fetchCount } from './count'

// Mismo enfoque que `client.test.ts`: se sustituye el adapter para observar el
// request final y devolver una respuesta con la forma del index de Rails.
const sent: InternalAxiosRequestConfig[] = []

// Una página de UNA fila con un total de miles: es exactamente el caso donde
// contar `data.length` daría 1 y el `meta.total` da la verdad.
const listAdapter: AxiosAdapter = async (config) => {
  sent.push(config)
  return {
    data: { data: [{ id: 1 }], meta: { page: 1, per_page: 1, total: 3092 } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

beforeEach(() => {
  sent.length = 0
  client.defaults.adapter = listAdapter
})

afterEach(() => {
  client.defaults.adapter = undefined
})

describe('fetchCount', () => {
  it('returns meta.total, not the length of the page', async () => {
    await expect(fetchCount('/orders', { status: 'pending' })).resolves.toBe(3092)
  })

  it('asks for a single row so the count does not carry a page with it', async () => {
    await fetchCount('/orders', { status: 'pending' })

    expect(sent).toHaveLength(1)
    expect(sent[0].url).toBe('/orders')
    expect(sent[0].params).toEqual({ status: 'pending', page: 1, per_page: 1 })
  })

  it('works without filters', async () => {
    await fetchCount('/shipments')

    expect(sent[0].params).toEqual({ page: 1, per_page: 1 })
  })

  // El filtro es lo que hace que el total sea el del scope y no el de la tabla:
  // si el caller lo manda, tiene que llegar tal cual.
  it('forwards every filter it receives', async () => {
    await fetchCount('/shipments', { status: 'in_transit', order_id: 7 })

    expect(sent[0].params).toEqual({ status: 'in_transit', order_id: 7, page: 1, per_page: 1 })
  })
})
