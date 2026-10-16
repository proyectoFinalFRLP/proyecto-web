import { describe, expect, it } from 'vitest'

import { sortParams } from './sortParams'

describe('sortParams', () => {
  it('sends the key and the direction the API reads', () => {
    expect(sortParams({ key: 'total', direction: 'desc' })).toEqual({
      sort: 'total',
      direction: 'desc',
    })
  })

  it('sends nothing without a sort, so the API keeps its usual order', () => {
    expect(sortParams(null)).toEqual({})
    expect(sortParams(undefined)).toEqual({})
  })
})
