import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { describe, expect, it, vi } from 'vitest'

import { fetchProvinces, fetchWarehouses, toPayload } from './api'

describe('toPayload', () => {
  it('sends the body Rails expects, trimmed and with the CPA in upper case', () => {
    expect(
      toPayload({
        name: ' Central ',
        address: ' Av. 7 ',
        zipCode: ' b1900abc ',
        city: ' La Plata ',
        province: 'Buenos Aires',
        capacity: ' 5000 ',
      }),
    ).toEqual({
      warehouse: {
        name: 'Central',
        address: 'Av. 7',
        zip_code: 'B1900ABC',
        city: 'La Plata',
        province: 'Buenos Aires',
        capacity: 5000,
      },
    })
  })

  // TESIS-185: la provincia se valida contra una lista, y `""` no está en ella.
  it('sends a blank city and province as null', () => {
    expect(
      toPayload({
        name: 'Central',
        address: 'Av. 7',
        zipCode: '1900',
        city: '  ',
        province: '',
        capacity: '',
      }).warehouse,
    ).toMatchObject({ city: null, province: null })
  })

  // Sin declarar no es cero: la API rechaza el 0 y el panel no dibuja la barra.
  it('sends a blank capacity as null', () => {
    expect(
      toPayload({
        name: 'Central',
        address: 'Av. 7',
        zipCode: '1900',
        city: '',
        province: '',
        capacity: ' ',
      }).warehouse.capacity,
    ).toBeNull()
  })
})

describe('fetchWarehouses', () => {
  it('reads the city and the province of each warehouse', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            name: 'Central',
            address: 'Av. 7',
            zip_code: '1900',
            city: 'La Plata',
            province: 'Buenos Aires',
            stored_units: 3,
            capacity: 800,
          },
        ],
        meta: { page: 1, per_page: 100, total: 1 },
      },
    } as AxiosResponse)

    expect(await fetchWarehouses()).toEqual([
      {
        id: 1,
        name: 'Central',
        address: 'Av. 7',
        zipCode: '1900',
        city: 'La Plata',
        province: 'Buenos Aires',
        storedUnits: 3,
        capacity: 800,
      },
    ])
  })

  // Un depósito anterior a TESIS-185, o una API que todavía no los manda.
  it('leaves them as null when they are missing', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce({
      data: {
        data: [{ id: 1, name: 'Central', address: 'Av. 7', zip_code: '1900' }],
        meta: { page: 1, per_page: 100, total: 1 },
      },
    } as AxiosResponse)

    expect((await fetchWarehouses())[0]).toMatchObject({
      city: null,
      province: null,
      capacity: null,
    })
  })
})

describe('fetchProvinces', () => {
  it('reads the same vocabulary the order destination uses', async () => {
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValueOnce({ data: { data: ['Buenos Aires', 'Córdoba'] } } as AxiosResponse)

    expect(await fetchProvinces()).toEqual(['Buenos Aires', 'Córdoba'])
    expect(get).toHaveBeenCalledWith('/orders/provinces')
  })
})
