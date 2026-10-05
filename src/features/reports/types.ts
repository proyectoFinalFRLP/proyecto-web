// Dominio de la pantalla de reportes (S14), traducido de
// `GET /api/v1/reports/overview` en `api.ts`.

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
  /** Unidades de las órdenes cuyo envío se despachó en el período. */
  dispatchedUnits: TrendedValue
  /** Facturación del período, en pesos, sin las órdenes canceladas. */
  revenue: TrendedValue
  /**
   * Porcentaje (0-100) de entregas dentro del plazo comprometido. `null`: el
   * modelo no guarda una fecha comprometida contra la cual medirlo.
   */
  onTimeDeliveryRate: TrendedValue | null
  /** `null`: el sistema todavía no registra anomalías. */
  activeAnomalies: {
    count: number
    /** Alguna de las anomalías abiertas es crítica: la tarjeta pasa a alerta. */
    critical: boolean
  } | null
}

/** Qué serie dibuja la curva de despacho. */
export type CurveMetric = 'orders' | 'revenue'

/** Un punto de la curva: el rótulo del eje X y el valor de cada serie. */
export interface CurvePoint {
  label: string
  orders: number
  revenue: number
}

/** Un punto por día o por semana, según el largo del período. */
export type CurveGranularity = 'day' | 'week'

/**
 * Envíos despachados en el período con un operador logístico, y cuántos de
 * esos ya llegaron. No es el cumplimiento de plazo del diseño: sin fecha
 * comprometida, es lo que el modelo puede afirmar.
 */
export interface CarrierDeliveries {
  /** Nombre del operador logístico, tal como lo devuelve la integración. */
  carrier: string
  dispatched: number
  delivered: number
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
  granularity: CurveGranularity
  curve: CurvePoint[]
  carriers: CarrierDeliveries[]
  /** `null`: el sistema todavía no registra anomalías (no es lo mismo que cero). */
  anomalies: RegionalAnomaly[] | null
}
