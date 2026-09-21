import type { ReportPeriod } from './types'

// Factory de query keys de la feature — nunca literales sueltos en los hooks
// (architecture.md §4.3). Los reportes son agregados de solo lectura: la única
// invalidación posible es la del dominio entero, `reportKeys.all`.

export const reportKeys = {
  all: ['reports'] as const,
  overview: (period: ReportPeriod) => [...reportKeys.all, 'overview', period] as const,
}
