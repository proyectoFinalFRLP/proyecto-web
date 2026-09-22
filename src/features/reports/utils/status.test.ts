import { describe, expect, it } from 'vitest'

import { anomalyRowTone, anomalyStatusVariant, serviceLevelTone } from './status'

describe('serviceLevelTone', () => {
  // Los cuatro operadores del diseño, cada uno en su tono.
  it('reproduces the four tones of the design', () => {
    expect(serviceLevelTone(99.4)).toBe('primary')
    expect(serviceLevelTone(96.8)).toBe('success')
    expect(serviceLevelTone(94.2)).toBe('warning')
    expect(serviceLevelTone(88.5)).toBe('error')
  })

  // Los umbrales son inclusivos: llegar justo al número es cumplirlo.
  it('treats the threshold itself as reached', () => {
    expect(serviceLevelTone(98)).toBe('primary')
    expect(serviceLevelTone(95)).toBe('success')
    expect(serviceLevelTone(90)).toBe('warning')
    expect(serviceLevelTone(89.9)).toBe('error')
  })
})

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
