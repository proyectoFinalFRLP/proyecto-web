import { TextField } from '@mui/material'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { LabeledField } from './LabeledField'

describe('LabeledField', () => {
  it('names the input with its label', () => {
    renderWithTheme(
      <LabeledField label="Ciudad">
        <TextField />
      </LabeledField>,
    )

    expect(screen.getByRole('textbox', { name: 'Ciudad' })).toBeInTheDocument()
  })

  it('marks a required field with an asterisk', () => {
    renderWithTheme(
      <LabeledField label="DNI / CUIT" required>
        <TextField required />
      </LabeledField>,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // La marca es sólo visual: el nombre accesible sigue siendo el rótulo, y la
  // obligatoriedad la anuncia el `required` del input (TESIS-173).
  it('keeps the asterisk out of the accessible name', () => {
    renderWithTheme(
      <LabeledField label="DNI / CUIT" required>
        <TextField required />
      </LabeledField>,
    )

    expect(screen.getByRole('textbox', { name: 'DNI / CUIT' })).toBeRequired()
  })

  it('does not mark an optional field', () => {
    renderWithTheme(
      <LabeledField label="Ciudad">
        <TextField />
      </LabeledField>,
    )

    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})
