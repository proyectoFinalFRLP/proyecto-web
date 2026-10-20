import { describe, expect, it } from 'vitest'

import { SAMPLE_OVERVIEW } from '../sampleData'

import { buildReportCsv } from './export'

/** La fila que arranca con este rótulo. */
function rowOf(rows: unknown[][], label: string) {
  return rows.find((row) => row[0] === label)
}

/** Las filas del bloque que abre este título, hasta la fila en blanco. */
function block(rows: unknown[][], title: string) {
  const start = rows.findIndex((row) => row[0] === title)
  const end = rows.findIndex((row, index) => index > start && row.length === 0)
  return rows.slice(start + 1, end === -1 ? undefined : end)
}

describe('buildReportCsv', () => {
  it('says which period it covers, by name and by dates', () => {
    const rows = buildReportCsv(SAMPLE_OVERVIEW, '7d')

    expect(rows[0]).toEqual(['Reporte de la operación'])
    expect(rowOf(rows, 'Período')).toEqual(['Período', 'Últimos 7 días'])
    expect(rowOf(rows, 'Desde')).toEqual(['Desde', '2026-09-28'])
    expect(rowOf(rows, 'Hasta')).toEqual(['Hasta', '2026-10-04'])
  })

  // Los números van crudos: son para hacer cuentas en la planilla.
  it('writes each metric with its raw value and its variation', () => {
    const rows = buildReportCsv(SAMPLE_OVERVIEW, '30d')

    expect(rowOf(rows, 'Facturación ($)')).toEqual(['Facturación ($)', 4_200_000, 8.1])
    expect(rowOf(rows, 'Cumplimiento de entregas (%)')).toEqual([
      'Cumplimiento de entregas (%)',
      98.2,
      -0.4,
    ])
    expect(rowOf(rows, 'Anomalías activas (hoy)')).toEqual([
      'Anomalías activas (hoy)',
      142,
      null,
      'Hay al menos una crítica',
    ])
  })

  // Sin entregas que medir no es un 0%: la celda queda vacía y dice por qué.
  it('leaves the on time rate empty, with the reason, when there is nothing to measure', () => {
    const rows = buildReportCsv(
      { ...SAMPLE_OVERVIEW, kpis: { ...SAMPLE_OVERVIEW.kpis, onTimeDeliveryRate: null } },
      '30d',
    )

    expect(rowOf(rows, 'Cumplimiento de entregas (%)')).toEqual([
      'Cumplimiento de entregas (%)',
      null,
      null,
      'Sin entregas con fecha comprometida',
    ])
  })

  it('writes the sales curve by date, not by axis label', () => {
    const curve = block(buildReportCsv(SAMPLE_OVERVIEW, '7d'), 'Curva de ventas')

    expect(curve[0]).toEqual(['Día', 'Órdenes', 'Facturación ($)'])
    expect(curve[1]).toEqual(['2026-09-28', 2_400, 380_000])
    expect(curve).toHaveLength(1 + SAMPLE_OVERVIEW.curve.length)
  })

  it('names the weekly curve by the week it opens', () => {
    const curve = block(
      buildReportCsv({ ...SAMPLE_OVERVIEW, granularity: 'week' }, '90d'),
      'Curva de ventas',
    )

    expect(curve[0][0]).toBe('Semana desde')
  })

  it('writes the deliveries of each carrier', () => {
    const carriers = block(buildReportCsv(SAMPLE_OVERVIEW, '7d'), 'Entregas por operador')

    expect(carriers).toEqual([
      ['Operador', 'Despachados', 'Entregados'],
      ['Andreani', 180, 171],
      ['Moova', 95, 88],
      ['Correo Argentino', 60, 41],
    ])
  })

  it('writes each delayed shipment as the table shows it', () => {
    const anomalies = block(buildReportCsv(SAMPLE_OVERVIEW, '7d'), 'Envíos demorados')

    expect(anomalies[1]).toEqual([
      '#40',
      'CD Ezeiza',
      'Andreani',
      '2026-10-01',
      3,
      4_200,
      'Crítico',
    ])
    expect(anomalies[2][0]).toBe('#1001')
    // Lo que el envío no registra queda vacío, no «null».
    expect(anomalies[3]).toEqual(['#ML-2001', null, null, '2026-09-29', 2, 12, 'Resuelto'])
  })
})
