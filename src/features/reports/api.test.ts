import { describe, expect, it } from 'vitest'

import { curveLabel, toOverview } from './api'

const API_OVERVIEW = {
  period: '7d' as const,
  from: '2026-09-26T00:00:00-03:00',
  to: '2026-10-02T01:30:00-03:00',
  granularity: 'day' as const,
  kpis: {
    revenue: { value: 4500, trend: 12.5 },
    dispatched_units: { value: 9, trend: -10 },
    on_time_delivery_rate: null,
    active_anomalies: { count: 0, critical: false },
  },
  curve: [
    { date: '2026-09-26', orders: 1, revenue: 1500 },
    { date: '2026-09-27', orders: 0, revenue: 0 },
  ],
  carriers: [{ company_integration_id: 3, name: 'Andreani', dispatched: 4, delivered: 1 }],
  anomalies: [
    {
      shipment_id: 12,
      order_id: 40,
      external_order_id: null,
      external_order_number: '#1001',
      courier: { id: 3, service_id: 5, name: 'Andreani' },
      origin_warehouse: { id: 1, name: 'Depósito Central' },
      promised_delivery_on: '2026-09-29',
      days_late: 4,
      units: 6,
      status: 'critical' as const,
    },
  ],
}

describe('curveLabel', () => {
  it('names the weekday in a one-week report', () => {
    expect(curveLabel('2026-09-28', '7d')).toBe('lun')
  })

  it('uses day and month in the longer ones, where weekdays would repeat', () => {
    expect(curveLabel('2026-09-28', '30d')).toBe('28/09')
  })

  // La fecha es un día calendario: interpretarla en la zona del navegador lo
  // correría al día anterior al oeste de UTC.
  it('never moves the day with the time zone of the browser', () => {
    expect(curveLabel('2026-10-01', '90d')).toBe('01/10')
  })
})

describe('toOverview', () => {
  it('keeps the trend the API computed, and its absence', () => {
    const { kpis } = toOverview(API_OVERVIEW)

    expect(kpis.revenue).toEqual({ value: 4500, trend: 12.5 })
    expect(kpis.dispatchedUnits).toEqual({ value: 9, trend: -10 })
  })

  // `null` es «ninguna entrega con fecha comprometida en el período», no un 0%.
  it('keeps an on time rate without deliveries to measure as null', () => {
    expect(toOverview(API_OVERVIEW).kpis.onTimeDeliveryRate).toBeNull()
  })

  it('keeps the rate and its trend when there is one', () => {
    const { kpis } = toOverview({
      ...API_OVERVIEW,
      kpis: { ...API_OVERVIEW.kpis, on_time_delivery_rate: { value: 87.5, trend: -3.2 } },
    })

    expect(kpis.onTimeDeliveryRate).toEqual({ value: 87.5, trend: -3.2 })
  })

  // Siempre llega: cero anomalías es un dato, no la falta de uno.
  it('reads the active anomalies as a count, zero included', () => {
    expect(toOverview(API_OVERVIEW).kpis.activeAnomalies).toEqual({ count: 0, critical: false })
  })

  it('translates each delayed shipment to the domain', () => {
    expect(toOverview(API_OVERVIEW).anomalies).toEqual([
      {
        shipmentId: 12,
        order: { id: 40, externalOrderId: null, externalOrderNumber: '#1001' },
        courier: 'Andreani',
        originWarehouse: 'Depósito Central',
        promisedDeliveryOn: '2026-09-29',
        daysLate: 4,
        units: 6,
        status: 'critical',
      },
    ])
  })

  it('leaves the courier and the origin null when the shipment has none', () => {
    const [anomaly] = toOverview({
      ...API_OVERVIEW,
      anomalies: [{ ...API_OVERVIEW.anomalies[0], courier: null, origin_warehouse: null }],
    }).anomalies

    expect(anomaly).toMatchObject({ courier: null, originWarehouse: null })
  })

  // El día de adelante ya es el de Argentina: convertirlo lo correría.
  it('keeps the window of the report as calendar days', () => {
    const overview = toOverview(API_OVERVIEW)

    expect(overview.from).toBe('2026-09-26')
    expect(overview.to).toBe('2026-10-02')
  })

  it('turns the dates of the curve into axis labels, empty days included', () => {
    expect(toOverview(API_OVERVIEW).curve).toEqual([
      { date: '2026-09-26', label: 'sáb', orders: 1, revenue: 1500 },
      { date: '2026-09-27', label: 'dom', orders: 0, revenue: 0 },
    ])
  })

  it('translates the carriers', () => {
    expect(toOverview(API_OVERVIEW).carriers).toEqual([
      { carrier: 'Andreani', dispatched: 4, delivered: 1 },
    ])
  })
})
