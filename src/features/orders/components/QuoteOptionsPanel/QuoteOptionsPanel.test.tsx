import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { ShippingQuote } from '../../types'

import { QuoteOptionsPanel } from './QuoteOptionsPanel'
import type { QuoteOptionsPanelProps } from './QuoteOptionsPanel.types'

const QUOTE: ShippingQuote = {
  quoteIntegrationId: 7,
  dispatchIntegrationId: 4,
  providerName: 'Andreani',
  shippingCost: 58300,
  estimatedDays: 2,
}

function quotes(state: Partial<QuoteOptionsPanelProps['quotes']> = {}) {
  return {
    data: [QUOTE],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...state,
  } as QuoteOptionsPanelProps['quotes']
}

function renderPanel(props: Partial<QuoteOptionsPanelProps> = {}) {
  return renderWithTheme(
    <QuoteOptionsPanel quotes={quotes()} selectedId={null} onSelect={vi.fn()} {...props} />,
  )
}

describe('QuoteOptionsPanel', () => {
  it('lists the quoted options to choose from', () => {
    const onSelect = vi.fn()
    renderPanel({ onSelect })

    fireEvent.click(screen.getByRole('radio', { name: /Andreani/ }))

    expect(onSelect).toHaveBeenCalledWith(QUOTE)
  })

  it('offers to quote again when no carrier answered', () => {
    const empty = quotes({ data: [] })
    renderPanel({ quotes: empty })

    fireEvent.click(screen.getByRole('button', { name: 'Volver a cotizar' }))

    expect(empty.refetch).toHaveBeenCalled()
  })

  it('offers to review origin and destination only where they can be changed', () => {
    const onReview = vi.fn()
    const { unmount } = renderPanel({ quotes: quotes({ isError: true }), onReview })

    fireEvent.click(screen.getByRole('button', { name: 'Revisar origen y destino' }))
    expect(onReview).toHaveBeenCalled()
    unmount()

    renderPanel({ quotes: quotes({ isError: true }) })
    expect(
      screen.queryByRole('button', { name: 'Revisar origen y destino' }),
    ).not.toBeInTheDocument()
  })
})
