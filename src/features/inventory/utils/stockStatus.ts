import type { DataTableRowTone, StatusVariant } from 'shared/components'

import { inventoryCopy } from '../content'
import type { StockStatus } from '../types'

// Traducción del estado que devuelve el backend a lo que la pantalla muestra.
//
// El estado NO se calcula acá: lo resuelve la API, que es donde vive el umbral
// (TESIS-62). Si el front lo recalculara, pedir «stock bajo» y contar las filas
// amarillas podrían dar distinto.
//
// Son mapas explícitos y no un `switch` con default: si el backend suma un
// estado, el compilador marca este archivo en vez de pintarlo en gris.

const VARIANTS: Record<StockStatus, StatusVariant> = {
  available: 'success',
  low: 'warning',
  out_of_stock: 'error',
}

const LABELS: Record<StockStatus, string> = {
  available: inventoryCopy.stockStatus.available,
  low: inventoryCopy.stockStatus.low,
  out_of_stock: inventoryCopy.stockStatus.out_of_stock,
}

export function stockVariant(status: StockStatus): StatusVariant {
  return VARIANTS[status]
}

export function stockLabel(status: StockStatus): string {
  return LABELS[status]
}

/**
 * Énfasis de la fila. Sólo se resalta lo que está en cero, como en el diseño:
 * es la única situación que exige una acción hoy. Resaltar también el stock
 * bajo dejaría media tabla teñida y el resalte dejaría de significar algo.
 */
export function stockRowTone(status: StockStatus): DataTableRowTone {
  return status === 'out_of_stock' ? 'critical' : 'default'
}
