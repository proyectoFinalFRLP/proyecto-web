import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../../test/renderWithTheme'
import type { FailedEvent } from '../../types'

import { LastErrorCell } from './LastErrorCell'

const TECHNICAL = 'Integrations::AdapterExecutionError: Mercado Libre responded with HTTP 401'

const FAILED: FailedEvent = {
  id: 42,
  eventType: 'integrations.http_request',
  direction: 'outbound',
  status: 'pending',
  attempts: 1,
  maxAttempts: 5,
  nextRetryAt: null,
  errorCode: 'INT-002',
  errorMessage: 'El proveedor rechazó las credenciales de la conexión',
  lastError: TECHNICAL,
  lastResponseStatus: 401,
  createdAt: '2026-10-02T10:00:00Z',
}

function renderCell(event: Partial<FailedEvent> = {}) {
  return renderWithTheme(<LastErrorCell event={{ ...FAILED, ...event }} />)
}

describe('LastErrorCell', () => {
  it('shows the support code and the cause in words', () => {
    renderCell()

    expect(screen.getByText('INT-002')).toBeInTheDocument()
    expect(
      screen.getByText('El proveedor rechazó las credenciales de la conexión'),
    ).toBeInTheDocument()
  })

  // Lo que el operador le dicta a soporte: sin el id, el código solo no ubica el evento.
  it('gives the reference of the event next to the HTTP status', () => {
    renderCell()

    expect(screen.getByText('Ref. #42 · HTTP 401')).toBeInTheDocument()
  })

  it('gives the reference alone when the failure had no HTTP answer', () => {
    renderCell({ lastResponseStatus: null })

    expect(screen.getByText('Ref. #42')).toBeInTheDocument()
  })

  it('keeps the technical text off the screen until it is asked for', () => {
    renderCell()

    expect(screen.queryByText(TECHNICAL)).toBeNull()
  })

  it('shows the technical text as the description of the detail button', async () => {
    renderCell()

    const detail = screen.getByRole('button', { name: 'Detalle técnico del evento 42' })
    fireEvent.mouseOver(detail)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(TECHNICAL)
    expect(detail).toHaveAccessibleDescription(TECHNICAL)
  })

  it('says there is no detail when the event has no error', () => {
    renderCell({ errorCode: null, errorMessage: null, lastError: null })

    expect(screen.getByText('Sin detalle')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  // Un error que la API todavía no clasificó no muestra el texto técnico en su lugar.
  it('names an error without a code as unclassified', () => {
    renderCell({ errorCode: null, errorMessage: null })

    expect(screen.getByText('Error sin clasificar')).toBeInTheDocument()
    expect(screen.queryByText(TECHNICAL)).toBeNull()
  })
})
