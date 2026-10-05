import type { FailedEventFilters, FailedEventStatus } from './types'

// Factory de query keys de la feature — nunca literales sueltos en los hooks.
export const failedEventKeys = {
  all: ['failed-events'] as const,
  page: (filters: FailedEventFilters) => [...failedEventKeys.all, 'page', filters] as const,
  // `status ?? 'all'`: sin esto la clave de «todos» dependería de cómo se
  // serializa un `undefined`.
  count: (status: FailedEventStatus | undefined) =>
    [...failedEventKeys.all, 'count', status ?? 'all'] as const,
}
