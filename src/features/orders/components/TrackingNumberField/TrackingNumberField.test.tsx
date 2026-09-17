import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useNotificationStore } from 'shared/store'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { TrackingNumberField } from './TrackingNumberField'

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

function lastNotification() {
  return useNotificationStore.getState().notifications.at(-1)
}

afterEach(() => {
  useNotificationStore.setState({ notifications: [] })
})

describe('TrackingNumberField', () => {
  // Criterio de la card: sin tracking, «Pendiente de Despacho» y no un campo vacío.
  it('says the shipment is pending dispatch when there is no tracking number', () => {
    renderWithTheme(<TrackingNumberField trackingNumber={null} />)

    expect(screen.getByText('Pendiente de despacho')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // Criterio de la card: el número permite copiarse rápido.
  it('copies the tracking number to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    renderWithTheme(<TrackingNumberField trackingNumber="AND-9920-X8829-Z" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copiar número de seguimiento' }))

    expect(writeText).toHaveBeenCalledWith('AND-9920-X8829-Z')
    await waitFor(() => expect(lastNotification()?.severity).toBe('success'))
  })

  it('tells the operator when the clipboard is not available', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    renderWithTheme(<TrackingNumberField trackingNumber="AND-9920-X8829-Z" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copiar número de seguimiento' }))

    await waitFor(() => expect(lastNotification()?.severity).toBe('error'))
    expect(screen.getByText('AND-9920-X8829-Z')).toBeInTheDocument()
  })
})
