import { describe, expect, it } from 'vitest'

import { optionalEmail } from './contact'

describe('optionalEmail', () => {
  const schema = optionalEmail('Revisá el email.')

  it('takes a blank email: the contact is optional', () => {
    expect(schema.safeParse('').success).toBe(true)
    expect(schema.safeParse('   ').success).toBe(true)
  })

  it('takes a well formed email, trimmed', () => {
    expect(schema.parse(' marina@empresa.com ')).toBe('marina@empresa.com')
  })

  it('rejects something that is not an email', () => {
    expect(schema.safeParse('marina').success).toBe(false)
  })
})
