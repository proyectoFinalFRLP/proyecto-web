import type { AxiosResponse } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { client } from './client'
import { fetchProvinces } from './provinces'

describe('fetchProvinces', () => {
  // La orden y el depósito validan contra la misma lista (`Order::PROVINCES`).
  it('reads the vocabulary of the orders endpoint', async () => {
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValueOnce({ data: { data: ['Buenos Aires', 'Córdoba'] } } as AxiosResponse)

    expect(await fetchProvinces()).toEqual(['Buenos Aires', 'Córdoba'])
    expect(get).toHaveBeenCalledWith('/orders/provinces')
  })
})
