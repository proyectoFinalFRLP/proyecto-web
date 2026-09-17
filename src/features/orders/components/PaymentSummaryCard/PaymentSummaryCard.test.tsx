import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { PaymentSummaryCard } from './PaymentSummaryCard'

function summary() {
  return screen.getByRole('region', { name: 'Resumen de pago' })
}

describe('PaymentSummaryCard', () => {
  it('breaks the total down into products and shipping', () => {
    renderWithTheme(
      <PaymentSummaryCard
        subtotal="$ 1.420.000,00"
        shipping="$ 58.300,00"
        total="$ 1.478.300,00"
      />,
    )

    expect(within(summary()).getByText('$ 1.420.000,00')).toBeInTheDocument()
    expect(within(summary()).getByText('$ 58.300,00')).toBeInTheDocument()
    expect(within(summary()).getByText('$ 1.478.300,00')).toBeInTheDocument()
  })

  // Un envío sin costo no cuesta 0: se dice que falta cotizar.
  it('shows the shipping as pending when it has no cost yet', () => {
    renderWithTheme(
      <PaymentSummaryCard subtotal="$ 1.420.000,00" shipping={null} total="$ 1.420.000,00" />,
    )

    expect(within(summary()).getByText('Sin cotizar')).toBeInTheDocument()
  })

  it('keeps the invoice download visible but disabled', () => {
    renderWithTheme(<PaymentSummaryCard subtotal="$ 0,00" shipping={null} total="$ 0,00" />)

    expect(screen.getByRole('button', { name: 'Descargar factura' })).toBeDisabled()
  })
})
