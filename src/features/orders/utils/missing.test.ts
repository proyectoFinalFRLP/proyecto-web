import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { invalidFields } from './missing'

const schema = z.object({
  name: z.string().trim().min(1),
  document: z.string().trim().min(1),
  zipCode: z.string().regex(/^\d{4}$/),
})

const ORDER = ['name', 'document', 'zipCode'] as const

describe('invalidFields', () => {
  it('is empty when every field passes', () => {
    expect(
      invalidFields(schema, { name: 'Marina', document: '20', zipCode: '1193' }, ORDER),
    ).toEqual([])
  })

  // Los campos que nadie tocó cuentan igual: la lista no depende de `errors`.
  it('names every field that fails, untouched ones included', () => {
    expect(invalidFields(schema, { name: '', document: '', zipCode: '' }, ORDER)).toEqual([
      'name',
      'document',
      'zipCode',
    ])
  })

  // El orden es el de la pantalla, no el de los issues de Zod.
  it('keeps the order it was given', () => {
    expect(
      invalidFields(schema, { name: 'Marina', document: '', zipCode: 'x' }, [
        'zipCode',
        'document',
        'name',
      ]),
    ).toEqual(['zipCode', 'document'])
  })

  it('names a field once even when it fails more than one rule', () => {
    const strict = z.object({
      zipCode: z
        .string()
        .min(1)
        .regex(/^\d{4}$/),
    })

    expect(invalidFields(strict, { zipCode: '' }, ['zipCode'])).toEqual(['zipCode'])
  })
})
