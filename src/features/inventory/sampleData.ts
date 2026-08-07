// Datos de muestra del modal de edición.
//
// Existen sólo para poder abrir y revisar el modal mientras la vista real del
// catálogo no está construida (TESIS-62, que también trae el fetch). No son un
// mock de la API: el modal es presentacional y estos son los props que en
// producción van a venir de `GET /api/v1/products/:id` y `GET /api/v1/warehouses`.

import type { Product, Warehouse } from './types'

export const sampleWarehouses: Warehouse[] = [
  { id: 1, name: 'Centro de distribución', address: 'Av. Mitre 1200, Avellaneda' },
  { id: 2, name: 'Nodo secundario', address: 'Ruta 8 km 45, Pilar' },
  { id: 3, name: 'Depósito norte', address: 'Colectora Este 3400, San Isidro' },
]

export const sampleProduct: Product = {
  id: 1,
  sku: 'ISM-Z5-2024',
  name: 'Servomotor industrial Z5',
  description: 'Servomotor de precisión para líneas de armado.',
  weight: 12.5,
  dimensions: '45x30x30',
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  stocks: [
    { warehouseId: 1, quantity: 124, warehouse: sampleWarehouses[0] },
    { warehouseId: 2, quantity: 48, warehouse: sampleWarehouses[1] },
  ],
}
