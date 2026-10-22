import type { CsvCell } from 'shared/utils'

import { inventoryCopy } from '../content'
import type { Product } from '../types'

import { distributionPositions } from './stock'
import { stockLabel } from './stockStatus'

const { export: copy } = inventoryCopy.detail

// Una fila en blanco entre bloques: en la planilla se leen como tablas separadas.
const BLANK: CsvCell[] = []

/**
 * Las filas del CSV de la ficha: los datos del producto, de a un par
 * rótulo-valor, y después el stock por depósito con las mismas columnas que la
 * tabla de la pantalla. Pura, para probar qué baja sin disparar una descarga.
 *
 * Lo que no está cargado queda vacío, no «—»: en la planilla el guion sería un
 * texto, y una celda vacía es lo que dice «sin dato».
 */
export function buildProductCsv(product: Product): CsvCell[][] {
  return [
    [copy.title],
    [copy.fields.sku, product.sku],
    [copy.fields.name, product.name],
    [copy.fields.description, product.description],
    [copy.fields.category, product.category],
    [copy.fields.packaging, product.packaging],
    [copy.fields.standard, product.technicalStandard],
    [copy.fields.weight, product.weight],
    [copy.fields.length, product.lengthCm],
    [copy.fields.width, product.widthCm],
    [copy.fields.height, product.heightCm],
    [copy.fields.status, stockLabel(product.stockStatus)],
    [copy.fields.onHand, product.onHand],
    [copy.fields.committed, product.committed],
    [copy.fields.inTransit, product.inTransitQuantity],
    [copy.fields.availableToPromise, product.availableToPromise],
    [copy.fields.lowStockThreshold, product.lowStockThreshold],
    [copy.fields.updatedAt, product.updatedAt],
    BLANK,
    [copy.warehouses.title],
    [...copy.warehouses.header],
    ...distributionPositions(product).map((position) => [
      position.name,
      position.location,
      position.onHand,
      position.committed,
      position.incoming,
      stockLabel(position.stockStatus),
    ]),
  ]
}
