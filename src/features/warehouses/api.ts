import { client } from 'shared/api/client'
import type { DataTableSort } from 'shared/components'
import { sortParams } from 'shared/utils'

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
  /** Opcionales: una API anterior a TESIS-185 no los manda. */
  city?: string | null
  province?: string | null
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
    city: warehouse.city ?? null,
    province: warehouse.province ?? null,
    // El alta y la edición responden con el mismo serializer, pero un depósito
    // recién creado guarda cero unidades: el `?? 0` es para no depender de eso.
    storedUnits: warehouse.stored_units ?? 0,
  }
}

// Un campo opcional en blanco viaja como `null` y no como `""`: la provincia se
// valida contra una lista y el texto vacío no está en ella (el mismo 422 que
// tuvo el retiro en el local con la provincia de la orden, TESIS-178).
function blankToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toPayload(input: WarehouseInput): WarehousePayload {
  return {
    warehouse: {
      name: input.name.trim(),
      address: input.address.trim(),
      zip_code: input.zipCode.trim().toUpperCase(),
      city: blankToNull(input.city),
      province: blankToNull(input.province),
    },
  }
}

/** Todos los depósitos, en el orden pedido (TESIS-184) o en el de siempre. */
export async function fetchWarehouses(sort: DataTableSort | null = null): Promise<Warehouse[]> {
  const { data } = await client.get<ApiList<ApiWarehouse>>('/warehouses', {
    params: sortParams(sort),
  })

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
 * Las provincias que acepta un depósito: `Order::PROVINCES`, la misma lista que
 * el domicilio de una orden, y por eso se lee del mismo endpoint. Se pide acá y
 * no se importa de órdenes porque una feature no importa de otra
 * (architecture.md §3.2).
 */
export async function fetchProvinces(): Promise<string[]> {
  const { data } = await client.get<{ data: string[] }>('/orders/provinces')

  return data.data
}

/**
 * Baja de un depósito. La API responde **409** si tiene stock, si salieron
 * ventas de él o si una transferencia lo tiene como origen o destino: son
 * registros que un DELETE no puede evaporar.
 */
export async function deleteWarehouse(id: number): Promise<void> {
  await client.delete(`/warehouses/${id}`)
}
