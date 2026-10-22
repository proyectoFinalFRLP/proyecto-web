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
   * Porcentaje (0-100) de los envíos entregados en el período que llegaron
   * para su fecha comprometida. `null`: ninguna entrega del período tenía
   * fecha comprometida, así que no hay plazo contra el cual medir (no es un 0%).
   * Su `trend` va en puntos y no es relativo: de 50% a 75% es `25`.
   */
  onTimeDeliveryRate: TrendedValue | null
  /**
   * Los envíos en curso que hoy están demorados. No depende del período: es la
   * foto de ahora. Siempre llega, con `count: 0` si no hay ninguno.
   */
  activeAnomalies: {
    count: number
    /** Alguno lleva 3 días o más de demora: la tarjeta pasa a alerta. */
    critical: boolean
  }
}

/** Qué serie dibuja la curva de ventas. */
export type CurveMetric = 'orders' | 'revenue'

/** Un punto de la curva: el día, su rótulo del eje X y el valor de cada serie. */
export interface CurvePoint {
  /** El día (`2026-09-26`), o el lunes que abre la semana en la curva semanal. */
  date: string
  label: string
  orders: number
  revenue: number
}

/** Un punto por día o por semana, según el largo del período. */
export type CurveGranularity = 'day' | 'week'

/**
 * Envíos despachados en el período con un operador logístico, y cuántos de
 * esos ya llegaron. No es el cumplimiento de plazo del diseño: la API mide el
 * plazo para la empresa entera (`onTimeDeliveryRate`), no por operador.
 */
export interface CarrierDeliveries {
  /** Nombre del operador logístico, tal como lo devuelve la integración. */
  carrier: string
  dispatched: number
  delivered: number
}

/**
 * Cómo está un envío demorado: `investigating` en curso con 1 o 2 días de
 * demora, `critical` en curso con 3 o más, `resolved` ya entregado pero
 * después de su fecha comprometida.
 */
export type AnomalyStatus = 'investigating' | 'critical' | 'resolved'

/**
 * Una anomalía es un envío demorado: pasó su fecha comprometida sin llegar, o
 * llegó después. No hay una entidad de incidente aparte: el dato es el envío.
 */
export interface ShipmentAnomaly {
  shipmentId: number
  /** La orden del envío, con lo que hace falta para nombrarla (`formatOrderId`). */
  order: { id: number; externalOrderId: string | null; externalOrderNumber: string | null }
  /** Nombre del operador logístico; `null` si el envío no lo registra. */
  courier: string | null
  /** Nombre del depósito del que salió; `null` en los envíos anteriores a guardarlo. */
  originWarehouse: string | null
  /** La fecha comprometida (`2026-10-15`, día calendario). */
  promisedDeliveryOn: string
  /** Días de demora: hasta hoy si sigue en curso, hasta la entrega si ya llegó. */
  daysLate: number
  units: number
  status: AnomalyStatus
}

export interface ReportsOverview {
  /** La ventana del reporte, en días calendario (`2026-09-20`). */
  from: string
  to: string
  kpis: ReportsKpis
  granularity: CurveGranularity
  curve: CurvePoint[]
  carriers: CarrierDeliveries[]
  /** Hasta diez, las abiertas primero. Vacío es «ninguna»: el dato existe. */
  anomalies: ShipmentAnomaly[]
}
