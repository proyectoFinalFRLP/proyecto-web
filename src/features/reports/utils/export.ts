import { formatOrderId } from 'shared/utils'
import type { CsvCell } from 'shared/utils'

import { reportsCopy } from '../content'
import type { ReportPeriod, ReportsOverview, TrendedValue } from '../types'

import { anomalyStatusLabel } from './status'

const { export: copy, period: periodCopy } = reportsCopy

// Una fila en blanco entre bloques: en la planilla se leen como tablas separadas.
const BLANK: CsvCell[] = []

function kpiRow(label: string, kpi: TrendedValue, note?: string): CsvCell[] {
  return note === undefined ? [label, kpi.value, kpi.trend] : [label, kpi.value, kpi.trend, note]
}

/**
 * Las filas del CSV del reporte: los cuatro bloques de la pantalla, en su
 * orden, para el período elegido. Pura y aparte de la página, para probar qué
 * baja sin disparar una descarga.
 *
 * Los números van crudos (ver `shared/utils/csv.ts`); lo que la pantalla dice
 * con palabras —un cumplimiento sin entregas que medir, una variación sin
 * período anterior— va como celda vacía o con su aclaración, nunca como un 0.
 */
export function buildReportCsv(overview: ReportsOverview, period: ReportPeriod): CsvCell[][] {
  const { kpis, curve, carriers, anomalies, granularity } = overview
  const onTime = kpis.onTimeDeliveryRate

  return [
    [copy.title],
    [copy.period, periodCopy.options[period]],
    [copy.from, overview.from],
    [copy.to, overview.to],
    BLANK,
    [...copy.kpis.header],
    kpiRow(copy.kpis.revenue, kpis.revenue),
    kpiRow(copy.kpis.dispatchedUnits, kpis.dispatchedUnits),
    onTime === null
      ? [copy.kpis.onTimeDelivery, null, null, copy.kpis.onTimeUnavailable]
      : kpiRow(copy.kpis.onTimeDelivery, onTime, copy.kpis.onTimeTrendInPoints),
    [
      copy.kpis.activeAnomalies,
      kpis.activeAnomalies.count,
      null,
      kpis.activeAnomalies.critical ? copy.kpis.critical : null,
    ],
    BLANK,
    [copy.curve.title],
    copy.curve.header(granularity),
    ...curve.map((point) => [point.date, point.orders, point.revenue]),
    BLANK,
    [copy.carriers.title],
    [...copy.carriers.header],
    ...carriers.map((row) => [row.carrier, row.dispatched, row.delivered]),
    BLANK,
    [copy.anomalies.title],
    [...copy.anomalies.header],
    ...anomalies.map((anomaly) => [
      formatOrderId(
        anomaly.order.externalOrderId,
        anomaly.order.id,
        anomaly.order.externalOrderNumber,
      ),
      anomaly.originWarehouse,
      anomaly.courier,
      anomaly.promisedDeliveryOn,
      anomaly.daysLate,
      anomaly.units,
      anomalyStatusLabel(anomaly.status),
    ]),
  ]
}
