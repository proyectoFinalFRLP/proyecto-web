import { SAMPLE_OVERVIEW } from './sampleData'
import type { ReportPeriod, ReportsOverview } from './types'

// Frontera con la API de reportes.
//
// El endpoint de agregados NO EXISTE todavía. De los siete bloques de S14, seis
// no tienen dominio detrás (comentarios de TESIS-64, 2026-08-29): `orders` no
// guarda facturación por período, `shipments` no tiene fecha comprometida con
// qué medir el cumplimiento, y no hay anomalías, regiones ni nivel de servicio
// por operador en el modelo. Lo que hay son los listados paginados, y ninguno
// filtra por fecha, así que ni el volumen puede acotarse al período elegido.
//
// Hasta que exista, esta función resuelve el dataset de muestra del diseño. Es
// el único lugar que cambia cuando la API lo exponga: recibe el período,
// devuelve el `ReportsOverview` del dominio, y la pantalla no se entera.

/**
 * Mientras sea `true`, la pantalla lo dice junto al título. Se borra con
 * `sampleData.ts` el día que `fetchReportsOverview` hable con Rails.
 */
export const REPORTS_DATA_IS_SAMPLE = true

// `_period` queda declarado a propósito: es parte del contrato del endpoint y
// de la query key, aunque la muestra no lo mire.
export function fetchReportsOverview(_period: ReportPeriod): Promise<ReportsOverview> {
  return Promise.resolve(SAMPLE_OVERVIEW)
}
