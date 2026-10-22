import { describe, expect, it } from 'vitest'

import { formatCalendarDate } from './calendarDate'

describe('formatCalendarDate', () => {
  it('names the day and the month, as the rest of the product does', () => {
    expect(formatCalendarDate('2026-10-22')).toBe('22 oct')
  })

  // Es un día y no un instante: en la zona del navegador, al oeste de UTC, la
  // medianoche del 1 caería el 30 del mes anterior.
  it('never moves the day with the time zone of the browser', () => {
    expect(formatCalendarDate('2026-10-01')).toBe('1 oct')
  })
})
