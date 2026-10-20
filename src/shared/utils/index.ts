export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  return new Intl.DateTimeFormat('es-AR', options).format(new Date(date))
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isNonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export { formatCalendarDate } from './calendarDate'
export { downloadCsv, toCsv } from './csv'
export type { CsvCell } from './csv'
export { formatOrderId } from './orderId'
export { formatRelativeTime } from './relativeTime'
export { sortParams } from './sortParams'
export {
  formatDecimal,
  formatInteger,
  formatMeasure,
  formatMoney,
  formatRoundMoney,
} from './number'
