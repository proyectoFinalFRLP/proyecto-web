import type { WarehouseLoad } from '../types'

// Reglas del widget de carga por depósito, fuera del componente para poder
// probarlas sin montar la pantalla.

/** Un depósito con el ancho que le toca en la barra. */
export interface WarehouseShare extends WarehouseLoad {
  /** 0-100. Proporción respecto del depósito más cargado, no de una capacidad. */
  share: number
}

/**
 * Los depósitos ordenados de más a menos cargado, con el ancho de cada barra.
 *
 * La referencia del 100% es el depósito más cargado y no una capacidad máxima:
 * `warehouses` no tiene ninguna, así que un porcentaje de ocupación sería un
 * número inventado. Lo que la barra dice es «este guarda la mitad que el que
 * más guarda», que es una comparación real.
 *
 * Con todos los depósitos vacíos el máximo es cero: todas las barras quedan en
 * cero en vez de dividir por cero y dar `NaN`.
 */
export function warehouseShares(warehouses: WarehouseLoad[]): WarehouseShare[] {
  const busiest = Math.max(0, ...warehouses.map((warehouse) => warehouse.storedUnits))

  return [...warehouses]
    .sort((a, b) => b.storedUnits - a.storedUnits)
    .map((warehouse) => ({
      ...warehouse,
      share: busiest === 0 ? 0 : (warehouse.storedUnits / busiest) * 100,
    }))
}

/** Unidades guardadas entre todos los depósitos. Es el epígrafe de la tarjeta. */
export function totalStoredUnits(warehouses: WarehouseLoad[]): number {
  return warehouses.reduce((total, warehouse) => total + warehouse.storedUnits, 0)
}
