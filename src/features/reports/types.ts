// Dominio de la pantalla de reportes (S14). Es el contrato que el endpoint de
// agregados tendrá que cumplir cuando exista: ver `api.ts`.

/** Ventana de tiempo sobre la que se calculan los agregados. */
export type ReportPeriod = '7d' | '30d' | '90d'

/**
 * Un agregado con su variación porcentual contra el período anterior. `trend`
 * es `null` cuando no hay período anterior con qué comparar (la primera
 * ventana de una empresa nueva): la tarjeta no muestra chip en vez de un 0%
 * que se leería como «igual que antes».
 */
export interface TrendedValue {
  value: number
  trend: number | null
}

export interface ReportsKpis {
  /** Unidades despachadas en el período. */
  dispatchedUnits: TrendedValue
  /** Facturación del período, en pesos. */
  revenue: TrendedValue
  /** Porcentaje (0-100) de entregas dentro del plazo comprometido. */
  onTimeDeliveryRate: TrendedValue
  activeAnomalies: {
    count: number
    /** Alguna de las anomalías abiertas es crítica: la tarjeta pasa a alerta. */
    critical: boolean
  }
}

/** Qué serie dibuja la curva de despacho. */
export type CurveMetric = 'orders' | 'revenue'

/** Un punto de la curva: el rótulo del eje X y el valor de cada serie. */
export interface CurvePoint {
  label: string
  orders: number
  revenue: number
}

export interface CarrierServiceLevel {
  /** Nombre del operador logístico, tal como lo devuelve la integración. */
  carrier: string
  /** Porcentaje (0-100) de entregas en plazo, con decimales. */
  onTimeRate: number
}

export type AnomalyStatus = 'investigating' | 'critical' | 'resolved'

export interface RegionalAnomaly {
  /** Identificador del incidente («INC-8892»), sin el numeral. */
  id: string
  /** Centro de distribución afectado: nombre y código («CD Ezeiza», «BUE-4»). */
  node: { name: string; code: string }
  varianceType: string
  impactedUnits: number
  status: AnomalyStatus
}

export interface ReportsOverview {
  kpis: ReportsKpis
  curve: CurvePoint[]
  serviceLevels: CarrierServiceLevel[]
  anomalies: RegionalAnomaly[]
}
