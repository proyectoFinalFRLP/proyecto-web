import { describe, expect, it } from 'vitest'

import { categoryOptions } from './categories'

describe('categoryOptions', () => {
  it('offers the vocabulary of the API as it comes', () => {
    expect(categoryOptions(['Electronics', 'Power'], 'Power')).toEqual(['Electronics', 'Power'])
  })

  it('keeps the current value when the list does not have it', () => {
    expect(categoryOptions(['Electronics'], 'Vintage')).toEqual(['Vintage', 'Electronics'])
  })

  // Primer render: la lista todavía no llegó y el filtro de la URL ya aplica.
  it('offers the current value before the list arrives', () => {
    expect(categoryOptions([], 'Power')).toEqual(['Power'])
  })

  it('adds nothing for no category', () => {
    expect(categoryOptions(['Electronics'], '')).toEqual(['Electronics'])
  })

  it('does not hand back the array it received', () => {
    const categories = ['Electronics']

    expect(categoryOptions(categories, '')).not.toBe(categories)
  })
})
