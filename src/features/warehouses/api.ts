import { client } from 'shared/api/client'

import type { Warehouse, WarehouseInput, WarehousePayload } from './types'

// Frontera con la API Rails para los depósitos. Ningún componente ve el
// snake_case.
//
// El listado no pagina de verdad: la API devuelve hasta 100 depósitos de una
// vez (`WHOLE_LIST_PER_PAGE`) porque los usa para llenar selects. Una empresa
// con más de cien depósitos no es un caso del MVP.

interface ApiWarehouse {
  id: number
  name: string
  address: string
  zip_code: string
  stored_units?: number
}

interface ApiList<T> {
  data: T[]
  meta: { page: number; per_page: number; total: number }
}

function toWarehouse(warehouse: ApiWarehouse): Warehouse {
  return {
    id: warehouse.id,
    name: warehouse.name,
    address: warehouse.address,
    zipCode: warehouse.zip_code,
    // El alta y la edición responden con el mismo serializer, pero un depósito
    // recién creado guarda cero unidades: el `?? 0` es para no depender de eso.
    storedUnits: warehouse.stored_units ?? 0,
  }
}

export function toPayload(input: WarehouseInput): WarehousePayload {
  return {
    warehouse: {
      name: input.name.trim(),
      address: input.address.trim(),
      zip_code: input.zipCode.trim().toUpperCase(),
    },
  }
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data } = await client.get<ApiList<ApiWarehouse>>('/warehouses')

  return data.data.map(toWarehouse)
}

export async function createWarehouse(input: WarehouseInput): Promise<Warehouse> {
  const { data } = await client.post<ApiWarehouse>('/warehouses', toPayload(input))

  return toWarehouse(data)
}

export async function updateWarehouse(id: number, input: WarehouseInput): Promise<Warehouse> {
  const { data } = await client.put<ApiWarehouse>(`/warehouses/${id}`, toPayload(input))

  return toWarehouse(data)
}

/**
 * Baja de un depósito. La API responde **409** si tiene stock, si salieron
 * ventas de él o si una transferencia lo tiene como origen o destino: son
 * registros que un DELETE no puede evaporar.
 */
export async function deleteWarehouse(id: number): Promise<void> {
  await client.delete(`/warehouses/${id}`)
}
