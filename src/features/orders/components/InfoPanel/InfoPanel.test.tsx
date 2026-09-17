import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { InfoPanel } from './InfoPanel'

describe('InfoPanel', () => {
  it('names the panel after its title and pairs every value with its label', () => {
    renderWithTheme(
      <InfoPanel
        title="Datos del cliente"
        icon={<PersonOutlineIcon />}
        fields={[
          { id: 'name', label: 'Razón social', value: 'Global Tech Solutions S.A.' },
          { id: 'phone', label: 'Teléfono', value: '—', unknown: true },
        ]}
      />,
    )

    const panel = screen.getByRole('region', { name: 'Datos del cliente' })
    const terms = within(panel)
      .getAllByRole('term')
      .map((term) => term.textContent)
    const definitions = within(panel)
      .getAllByRole('definition')
      .map((definition) => definition.textContent)

    expect(terms).toEqual(['Razón social', 'Teléfono'])
    expect(definitions).toEqual(['Global Tech Solutions S.A.', '—'])
  })

  it('shows the footnote that explains what the model does not record', () => {
    renderWithTheme(
      <InfoPanel
        title="Datos del envío"
        icon={<PersonOutlineIcon />}
        fields={[]}
        footnote="El envío no registra el tipo de servicio."
      />,
    )

    expect(screen.getByText('El envío no registra el tipo de servicio.')).toBeInTheDocument()
  })
})
