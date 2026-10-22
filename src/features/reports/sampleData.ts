import type { ReportsOverview } from './types'

// El dataset de S14-Reportes con la forma de `GET /reports/overview`. No es lo
// que muestra la pantalla —los agregados salen de la API, ver `api.ts`—: queda
// como fixture de las pruebas de los componentes, que necesitan valores en
// todos los bloques.

export const SAMPLE_OVERVIEW: ReportsOverview = {
  from: '2026-09-28',
  to: '2026-10-04',
  kpis: {
    dispatchedUnits: { value: 124_592, trend: 12.4 },
    revenue: { value: 4_200_000, trend: 8.1 },
    onTimeDeliveryRate: { value: 98.2, trend: -0.4 },
    activeAnomalies: { count: 142, critical: true },
  },
  // Una semana, con la forma de la curva del diseño. La facturación por día
  // suma la de la tarjeta.
  curve: [
    { date: '2026-09-28', label: 'lun', orders: 2_400, revenue: 380_000 },
    { date: '2026-09-29', label: 'mar', orders: 3_400, revenue: 520_000 },
    { date: '2026-09-30', label: 'mié', orders: 5_900, revenue: 610_000 },
    { date: '2026-10-01', label: 'jue', orders: 7_800, revenue: 720_000 },
    { date: '2026-10-02', label: 'vie', orders: 6_200, revenue: 560_000 },
    { date: '2026-10-03', label: 'sáb', orders: 8_200, revenue: 690_000 },
    { date: '2026-10-04', label: 'dom', orders: 9_400, revenue: 740_000 },
  ],
  granularity: 'day',
  // Los operadores del producto (docs/design/README.md), no los del Figma viejo.
  carriers: [
    { carrier: 'Andreani', dispatched: 180, delivered: 171 },
    { carrier: 'Moova', dispatched: 95, delivered: 88 },
    { carrier: 'Correo Argentino', dispatched: 60, delivered: 41 },
  ],
  // Las abiertas primero, la crítica arriba; después la resuelta.
  anomalies: [
    {
      shipmentId: 12,
      order: { id: 40, externalOrderId: null, externalOrderNumber: null },
      courier: 'Andreani',
      originWarehouse: 'CD Ezeiza',
      promisedDeliveryOn: '2026-10-01',
      daysLate: 3,
      units: 4_200,
      status: 'critical',
    },
    {
      shipmentId: 15,
      order: { id: 41, externalOrderId: '18948032757993', externalOrderNumber: '#1001' },
      courier: 'Moova',
      originWarehouse: 'CD Córdoba',
      promisedDeliveryOn: '2026-10-03',
      daysLate: 1,
      units: 850,
      status: 'investigating',
    },
    {
      shipmentId: 9,
      order: { id: 37, externalOrderId: 'ML-2001', externalOrderNumber: null },
      courier: null,
      originWarehouse: null,
      promisedDeliveryOn: '2026-09-29',
      daysLate: 2,
      units: 12,
      status: 'resolved',
    },
  ],
}
