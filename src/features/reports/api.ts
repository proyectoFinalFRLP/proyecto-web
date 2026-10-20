import { client } from 'shared/api/client'

import type {
  AnomalyStatus,
  CurveGranularity,
  CurvePoint,
  ReportPeriod,
  ReportsOverview,
  ShipmentAnomaly,
  TrendedValue,
} from './types'

// Frontera con `GET /api/v1/reports/overview` (TESIS-999007). Ningún
// componente ve el snake_case ni las fechas crudas de la curva.
//
// Desde que el envío guarda su fecha comprometida, la API calcula también el
// cumplimiento de plazo y las anomalías (los envíos demorados). El
// cumplimiento puede llegar en `null`: ninguna entrega del período tenía fecha
// comprometida contra la cual medirlo. Las anomalías llegan siempre.

interface ApiTrended {
  value: number
  trend: number | null
}

interface ApiOverview {
  period: ReportPeriod
  from: string
  to: string
  granularity: CurveGranularity
  kpis: {
    revenue: ApiTrended
    dispatched_units: ApiTrended
    on_time_delivery_rate: ApiTrended | null
    active_anomalies: { count: number; critical: boolean }
  }
  curve: { date: string; orders: number; revenue: number }[]
  carriers: {
    company_integration_id: number
    name: string
    dispatched: number
    delivered: number
  }[]
  anomalies: ApiAnomaly[]
}

interface ApiAnomaly {
  shipment_id: number
  order_id: number
  external_order_id: string | null
  external_order_number: string | null
  courier: { id: number; service_id: number; name: string } | null
  origin_warehouse: { id: number; name: string } | null
  promised_delivery_on: string
  days_late: number
  units: number
  status: AnomalyStatus
}

// Las fechas de la curva son días calendario (`2026-09-26`) ya cortados en
// hora de Argentina por la API. Se formatean en UTC a propósito: interpretarlas
// en la zona del navegador correría el día en cualquier huso al oeste de UTC.
const WEEKDAY = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: 'UTC' })

/**
 * Rótulo del eje X: el día de la semana en una semana («lun»), y día/mes en
 * los períodos más largos («26/09»), donde el día de la semana se repetiría.
 * En la curva semanal es el lunes que abre cada semana.
 */
export function curveLabel(date: string, period: ReportPeriod): string {
  if (period !== '7d') {
    // Armado a mano y no con `Intl`: según la versión de ICU, `es-AR` con
    // `2-digit` da «28/09» o «28/9», y el rótulo es la identidad del punto.
    const [, month, day] = date.split('-')
    return `${day}/${month}`
  }

  return WEEKDAY.format(new Date(`${date}T00:00:00Z`)).replace('.', '')
}

function toTrended(value: ApiTrended): TrendedValue {
  return { value: value.value, trend: value.trend }
}

function toCurve(points: ApiOverview['curve'], period: ReportPeriod): CurvePoint[] {
  return points.map((point) => ({
    date: point.date,
    label: curveLabel(point.date, period),
    orders: point.orders,
    revenue: point.revenue,
  }))
}

function toAnomaly(anomaly: ApiAnomaly): ShipmentAnomaly {
  return {
    shipmentId: anomaly.shipment_id,
    order: {
      id: anomaly.order_id,
      externalOrderId: anomaly.external_order_id,
      externalOrderNumber: anomaly.external_order_number,
    },
    courier: anomaly.courier?.name ?? null,
    originWarehouse: anomaly.origin_warehouse?.name ?? null,
    promisedDeliveryOn: anomaly.promised_delivery_on,
    daysLate: anomaly.days_late,
    units: anomaly.units,
    status: anomaly.status,
  }
}

// `from` y `to` llegan como instantes en hora de Argentina
// (`2026-09-26T00:00:00-03:00`): la fecha de adelante ya es el día local, y
// cortarla ahí evita convertirla a la zona del navegador.
function calendarDay(instant: string): string {
  return instant.slice(0, 10)
}

export function toOverview(data: ApiOverview): ReportsOverview {
  const { kpis } = data

  return {
    from: calendarDay(data.from),
    to: calendarDay(data.to),
    kpis: {
      dispatchedUnits: toTrended(kpis.dispatched_units),
      revenue: toTrended(kpis.revenue),
      onTimeDeliveryRate:
        kpis.on_time_delivery_rate === null ? null : toTrended(kpis.on_time_delivery_rate),
      activeAnomalies: kpis.active_anomalies,
    },
    granularity: data.granularity,
    curve: toCurve(data.curve, data.period),
    carriers: data.carriers.map((carrier) => ({
      carrier: carrier.name,
      dispatched: carrier.dispatched,
      delivered: carrier.delivered,
    })),
    anomalies: data.anomalies.map(toAnomaly),
  }
}

export async function fetchReportsOverview(period: ReportPeriod): Promise<ReportsOverview> {
  const { data } = await client.get<ApiOverview>('/reports/overview', { params: { period } })

  return toOverview(data)
}
