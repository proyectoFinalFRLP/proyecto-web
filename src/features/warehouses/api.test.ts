import { describe, expect, it } from 'vitest'

import { toPayload } from './api'

describe('toPayload', () => {
  it('sends the body Rails expects, trimmed and with the CPA in upper case', () => {
    expect(toPayload({ name: ' Central ', address: ' Av. 7 ', zipCode: ' b1900abc ' })).toEqual({
      warehouse: { name: 'Central', address: 'Av. 7', zip_code: 'B1900ABC' },
    })
  })
})
