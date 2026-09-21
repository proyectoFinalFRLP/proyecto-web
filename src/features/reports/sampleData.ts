import type { ReportsOverview } from './types'

// El dataset de muestra de S14-Reportes, tal cual lo dibuja el diseño. Es lo
// que la pantalla muestra mientras no exista el endpoint de agregados (ver
// `api.ts`), y lo que usan las pruebas de los componentes. Se borra entero
// cuando la API lo reemplace.

export const SAMPLE_OVERVIEW: ReportsOverview = {
  kpis: {
    dispatchedUnits: { value: 124_592, trend: 12.4 },
    revenue: { value: 4_200_000, trend: 8.1 },
    onTimeDeliveryRate: { value: 98.2, trend: -0.4 },
    activeAnomalies: { count: 142, critical: true },
  },
  // Una semana, con la forma de la curva del diseño. La facturación por día
  // suma la de la tarjeta.
  curve: [
    { label: 'lun', orders: 2_400, revenue: 380_000 },
    { label: 'mar', orders: 3_400, revenue: 520_000 },
    { label: 'mié', orders: 5_900, revenue: 610_000 },
    { label: 'jue', orders: 7_800, revenue: 720_000 },
    { label: 'vie', orders: 6_200, revenue: 560_000 },
    { label: 'sáb', orders: 8_200, revenue: 690_000 },
    { label: 'dom', orders: 9_400, revenue: 740_000 },
  ],
  // Los operadores del producto (docs/design/README.md), no los del Figma viejo.
  serviceLevels: [
    { carrier: 'Andreani', onTimeRate: 99.4 },
    { carrier: 'Moova', onTimeRate: 96.8 },
    { carrier: 'Correo Argentino', onTimeRate: 94.2 },
    { carrier: 'OCASA', onTimeRate: 88.5 },
  ],
  anomalies: [
    {
      id: 'INC-8892',
      node: { name: 'CD Ezeiza', code: 'BUE-4' },
      varianceType: 'Demora por clima',
      impactedUnits: 4_200,
      status: 'investigating',
    },
    {
      id: 'INC-8891',
      node: { name: 'CD Córdoba', code: 'COR-1' },
      varianceType: 'Retención aduanera',
      impactedUnits: 850,
      status: 'critical',
    },
    {
      id: 'INC-8889',
      node: { name: 'CD Rosario', code: 'ROS-2' },
      varianceType: 'Caída de API del operador',
      impactedUnits: 12_000,
      status: 'resolved',
    },
  ],
}
