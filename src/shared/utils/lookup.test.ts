import { describe, expect, it } from 'vitest'

import { lookup } from './lookup'

const TONES = { pending: 'neutral', delivered: 'success' }

describe('lookup', () => {
  it('returns the value of a key the map has', () => {
    expect(lookup(TONES, 'delivered', 'neutral')).toBe('success')
  })

  // El backend sumó un estado antes que el front.
  it('falls back for a key the map does not know', () => {
    expect(lookup(TONES, 'lost', 'neutral')).toBe('neutral')
  })

  it('does not take a key from the prototype', () => {
    expect(lookup(TONES, 'constructor', 'neutral')).toBe('neutral')
    expect(lookup(TONES, 'toString', 'neutral')).toBe('neutral')
  })
})
