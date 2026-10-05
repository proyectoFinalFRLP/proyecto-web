import { describe, expect, it } from 'vitest'

import { curveLabel, toOverview } from './api'

const API_OVERVIEW = {
  period: '7d' as const,
  from: '2026-09-26T00:00:00-03:00',
  to: '2026-10-02T01:30:00-03:00',
  granularity: 'day' as const,
  kpis: {
    orders: { value: 3, trend: null },
    revenue: { value: 4500, trend: 12.5 },
    dispatched_units: { value: 9, trend: -10 },
    on_time_delivery_rate: null,
    active_anomalies: null,
  },
  curve: [
    { date: '2026-09-26', orders: 1, revenue: 1500 },
    { date: '2026-09-27', orders: 0, revenue: 0 },
  ],
  carriers: [{ company_integration_id: 3, name: 'Andreani', dispatched: 4, delivered: 1 }],
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

  it('leaves without value what the model cannot compute', () => {
    const overview = toOverview(API_OVERVIEW)

    expect(overview.kpis.onTimeDeliveryRate).toBeNull()
    expect(overview.kpis.activeAnomalies).toBeNull()
    expect(overview.anomalies).toBeNull()
  })

  it('turns the dates of the curve into axis labels, empty days included', () => {
    expect(toOverview(API_OVERVIEW).curve).toEqual([
      { label: 'sáb', orders: 1, revenue: 1500 },
      { label: 'dom', orders: 0, revenue: 0 },
    ])
  })

  it('translates the carriers', () => {
    expect(toOverview(API_OVERVIEW).carriers).toEqual([
      { carrier: 'Andreani', dispatched: 4, delivered: 1 },
    ])
  })
})
