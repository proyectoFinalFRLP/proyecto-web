import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { ApiRequestError, IntegrationService } from 'shared/api'
import { describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'

import { ConnectIntegrationModal } from './ConnectIntegrationModal'

const SHOPIFY: IntegrationService = {
  serviceId: 9,
  name: 'Shopify',
  type: 'ecommerce',
  authStrategy: 'oauth_client_credentials',
  credentialFields: [
    { key: 'client_id', label: 'Client ID', required: true, format: null },
    { key: 'client_secret', label: 'Client secret', required: true, format: null },
  ],
  settingFields: [
    { key: 'shop_domain', label: 'Dominio de la tienda', required: true, format: null },
  ],
  configured: true,
  isActive: true,
  integrationId: 3,
  settings: { shop_domain: 'demo.myshopify.com' },
  credentialsSet: ['client_id', 'client_secret'],
  testable: true,
  lastSyncedAt: null,
}

function renderModal(props: Partial<Parameters<typeof ConnectIntegrationModal>[0]> = {}) {
  const onSubmit = vi.fn()
  renderWithTheme(
    <ConnectIntegrationModal service={SHOPIFY} onSubmit={onSubmit} onClose={vi.fn()} {...props} />,
  )
  return { onSubmit }
}

describe('ConnectIntegrationModal', () => {
  it('builds the form out of the fields the template declares', () => {
    renderModal()

    // El secreto es un input de contraseña, que no tiene rol: se busca por su
    // label (MUI le agrega un espacio de ancho cero, de ahí la regex).
    expect(screen.getByRole('textbox', { name: 'Dominio de la tienda' })).toHaveValue(
      'demo.myshopify.com',
    )
    expect(screen.getByLabelText(/^Client secret/)).toHaveValue('')
  })

  // El back nunca devuelve un secreto: el form sólo sabe que está cargado, y
  // dejarlo vacío tiene que querer decir «no lo cambies».
  it('lets a loaded secret stay blank and does not send it', async () => {
    const { onSubmit } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        credentials: {},
        settings: { shop_domain: 'demo.myshopify.com' },
      }),
    )
  })

  it('shows each field error of a 422 next to its input', async () => {
    const submitError: ApiRequestError = Object.assign(new Error('Invalid integration data'), {
      status: 422,
      fields: { 'settings.shop_domain': ['invalid_format'] },
    })
    renderModal({ submitError })

    expect(await screen.findByText('El formato no es válido.')).toBeInTheDocument()
  })

  it('shows a rejection without fields above the form', () => {
    renderModal({ submitError: Object.assign(new Error('Algo falló'), { status: 500 }) })

    expect(screen.getByText('Algo falló')).toBeInTheDocument()
  })
})
