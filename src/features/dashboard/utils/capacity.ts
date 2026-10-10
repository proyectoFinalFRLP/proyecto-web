import type { WarehouseLoad } from '../types'

// Reglas del widget de carga por depósito, fuera del componente para poder
// probarlas sin montar la pantalla.

/** Un depósito con el ancho que le toca en la barra. */
export interface WarehouseShare extends WarehouseLoad {
  /**
   * 0-100. Ocupación real si el depósito declaró su capacidad (TESIS-162); si
   * no, proporción respecto del depósito más cargado.
   */
  share: number
  /** Qué mide la barra de esta fila, para poder decirlo en su rótulo. */
  measuredAgainstCapacity: boolean
}

/**
 * Los depósitos ordenados de más a menos cargado, con el ancho de cada barra.
 *
 * Con capacidad declarada (TESIS-162) la barra mide **ocupación**: cuánto de lo
 * que entra está ocupado. Sin capacidad la referencia sigue siendo el depósito
 * más cargado, porque esa es la única comparación real que queda: un porcentaje
 * de ocupación sin techo sería un número inventado.
 *
 * Los dos casos conviven: una empresa puede haber declarado la capacidad de
 * algunos depósitos y no de otros, y cada fila dice contra qué se mide.
 *
 * Con todos los depósitos vacíos el máximo es cero: todas las barras quedan en
 * cero en vez de dividir por cero y dar `NaN`. Por encima de la capacidad la
 * barra se corta en 100: un depósito pasado de su techo está lleno, no 140 %
 * lleno.
 */
export function warehouseShares(warehouses: WarehouseLoad[]): WarehouseShare[] {
  const busiest = Math.max(0, ...warehouses.map((warehouse) => warehouse.storedUnits))

  return [...warehouses]
    .sort((a, b) => b.storedUnits - a.storedUnits)
    .map((warehouse) => ({
      ...warehouse,
      share: shareOf(warehouse, busiest),
      measuredAgainstCapacity: warehouse.capacity !== null && warehouse.capacity > 0,
    }))
}

function shareOf(warehouse: WarehouseLoad, busiest: number): number {
  // `> 0` y no `!== null`: un techo en cero no define ninguna ocupación, y
  // `0 / 0` daría `NaN` en el ancho de la barra.
  if (warehouse.capacity !== null && warehouse.capacity > 0) {
    return Math.min(100, (warehouse.storedUnits / warehouse.capacity) * 100)
  }

  return busiest === 0 ? 0 : (warehouse.storedUnits / busiest) * 100
}

/** Unidades guardadas entre todos los depósitos. Es el epígrafe de la tarjeta. */
export function totalStoredUnits(warehouses: WarehouseLoad[]): number {
  return warehouses.reduce((total, warehouse) => total + warehouse.storedUnits, 0)
}
