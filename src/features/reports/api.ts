import { client } from 'shared/api/client'

import type {
  CurveGranularity,
  CurvePoint,
  ReportPeriod,
  ReportsOverview,
  TrendedValue,
} from './types'

// Frontera con `GET /api/v1/reports/overview` (TESIS-999007). Ningún
// componente ve el snake_case ni las fechas crudas de la curva.
//
// La API calcula sólo lo que el modelo permite: el cumplimiento de plazo y las
// anomalías llegan como `null` explícito (no hay fecha comprometida en los
// envíos ni una entidad de anomalía). La pantalla los muestra sin dato.

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
    orders: ApiTrended
    revenue: ApiTrended
    dispatched_units: ApiTrended
    on_time_delivery_rate: ApiTrended | null
    active_anomalies: { count: number; critical: boolean } | null
  }
  curve: { date: string; orders: number; revenue: number }[]
  carriers: {
    company_integration_id: number
    name: string
    dispatched: number
    delivered: number
  }[]
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
    label: curveLabel(point.date, period),
    orders: point.orders,
    revenue: point.revenue,
  }))
}

export function toOverview(data: ApiOverview): ReportsOverview {
  const { kpis } = data

  return {
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
    // La API no tiene anomalías: no es "ninguna en el período", es "no existen".
    anomalies: null,
  }
}

export async function fetchReportsOverview(period: ReportPeriod): Promise<ReportsOverview> {
  const { data } = await client.get<ApiOverview>('/reports/overview', { params: { period } })

  return toOverview(data)
}
