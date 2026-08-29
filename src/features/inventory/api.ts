import { client } from 'shared/api/client'

import type {
  CreateProductPayload,
  Product,
  ProductSummary,
  UpdateProductPayload,
  Warehouse,
} from './types'

// Frontera con la API Rails. Todo lo que entra en snake_case se traduce acá y
// sale como el dominio en camelCase; ningún componente ve la forma cruda.
//
// Dos detalles del backend que hay que respetar y no son obvios:
//   · `index` envuelve en `{ data: [...] }`, pero `show` y `update` devuelven el
//     objeto pelado (`ProductSerializer.render` sin wrapper).
//   · `index` usa `ProductListSerializer`, que NO incluye `stocks`. El detalle
//     por depósito sólo viene en `show`.

interface ApiWarehouse {
  id: number
  name: string
  address: string
  zip_code: string
}

interface ApiStock {
  id: number
  quantity: number
  warehouse_id: number
  warehouse: ApiWarehouse
}

interface ApiProductSummary {
  id: number
  sku: string
  name: string
  total_stock: number
}

interface ApiProduct {
  id: number
  sku: string
  name: string
  description: string | null
  weight: number
  dimensions: string | null
  updated_at: string
  stocks: ApiStock[]
}

interface ApiList<T> {
  data: T[]
  meta: { page: number; per_page: number; total: number }
}

function toWarehouse(warehouse: ApiWarehouse): Warehouse {
  return { id: warehouse.id, name: warehouse.name, address: warehouse.address }
}

function toProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    weight: product.weight,
    dimensions: product.dimensions,
    updatedAt: product.updated_at,
    stocks: (product.stocks ?? []).map((stock) => ({
      warehouseId: stock.warehouse_id,
      quantity: stock.quantity,
      warehouse: toWarehouse(stock.warehouse),
    })),
  }
}

export async function fetchProductList(page: number, perPage: number): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiList<ApiProductSummary>>('/products', {
    params: { page, per_page: perPage },
  })

  return data.data.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    totalStock: product.total_stock,
  }))
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await client.get<ApiProduct>(`/products/${id}`)

  return toProduct(data)
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data } = await client.get<ApiList<ApiWarehouse>>('/warehouses')

  return data.data.map(toWarehouse)
}

/**
 * Alta de producto. Crea el producto y sus stocks iniciales en una sola
 * transacción del lado del server (`Products::CreateProduct`).
 *
 * Un SKU repetido vuelve como 409 con `{ error: 'SKU already exists' }`; el
 * interceptor de Axios lo convierte en `Error` con ese mensaje.
 */
export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await client.post<ApiProduct>('/products', payload)

  return toProduct(data)
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  const { data } = await client.put<ApiProduct>(`/products/${id}`, payload)

  return toProduct(data)
}
