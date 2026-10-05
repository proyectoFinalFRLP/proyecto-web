import { describe, expect, it } from 'vitest'

import { anomalyRowTone, anomalyStatusVariant } from './status'

describe('anomalyStatusVariant', () => {
  it('maps each status to its semantic badge', () => {
    expect(anomalyStatusVariant('investigating')).toBe('warning')
    expect(anomalyStatusVariant('critical')).toBe('error')
    expect(anomalyStatusVariant('resolved')).toBe('success')
  })
})

describe('anomalyRowTone', () => {
  it('highlights only the critical row', () => {
    expect(anomalyRowTone('critical')).toBe('critical')
    expect(anomalyRowTone('investigating')).toBe('default')
    expect(anomalyRowTone('resolved')).toBe('default')
  })
})
