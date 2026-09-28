import { fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ApiRequestError } from 'shared/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import { authContent } from '../content'
import type * as registerHooks from '../hooks/useRegister'
import { useRegister } from '../hooks/useRegister'

import { RegisterPage } from './RegisterPage'

vi.mock('../hooks/useRegister', async (importOriginal) => ({
  ...(await importOriginal<typeof registerHooks>()),
  useRegister: vi.fn(),
}))

const mutate = vi.fn()

interface MutationState {
  isPending?: boolean
  isSuccess?: boolean
  error?: ApiRequestError | null
}

function mockRegister(state: MutationState = {}) {
  vi.mocked(useRegister).mockReturnValue({
    mutate,
    isPending: false,
    isSuccess: false,
    error: null,
    ...state,
  } as unknown as ReturnType<typeof useRegister>)
}

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<p>pantalla de ingreso</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Completa el formulario con un alta válida, salvo lo que se pise, y envía. */
type Field = 'email' | 'password' | 'passwordConfirmation'

function fillForm(overrides: Partial<Record<Field, string>> & { terms?: boolean } = {}) {
  const { terms = true, ...fields } = overrides
  const values: Record<Field, string> = {
    email: 'nuevo@empresa.com',
    password: 'secreta123',
    passwordConfirmation: 'secreta123',
    ...fields,
  }

  const labels: Record<Field, string> = {
    email: authContent.emailLabel,
    password: authContent.register.passwordLabel,
    passwordConfirmation: authContent.register.passwordConfirmationLabel,
  }

  for (const field of Object.keys(labels) as Field[]) {
    fireEvent.change(screen.getByLabelText(labels[field]), { target: { value: values[field] } })
  }

  if (terms) fireEvent.click(screen.getByRole('checkbox'))

  fireEvent.click(screen.getByRole('button', { name: authContent.register.submit }))
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRegister()
})

describe('RegisterPage', () => {
  it('sends the email and the password, and nothing else', async () => {
    renderPage()
    fillForm()

    // La confirmación es del formulario, no del contrato: la API sólo conoce
    // email y password.
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({ email: 'nuevo@empresa.com', password: 'secreta123' }),
    )
  })

  it('does not call the API without accepting the terms', async () => {
    renderPage()
    fillForm({ terms: false })

    expect(await screen.findByText(authContent.errors.termsRequired)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('does not call the API when the passwords do not match', async () => {
    renderPage()
    fillForm({ passwordConfirmation: 'otra-cosa' })

    expect(await screen.findByText(authContent.errors.passwordMismatch)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  // El mínimo es el de Devise (6): tipear 5 y esperar el viaje al servidor para
  // que conteste lo mismo es tiempo perdido.
  it('does not call the API when the password is too short', async () => {
    renderPage()
    fillForm({ password: 'corta', passwordConfirmation: 'corta' })

    expect(await screen.findByText(authContent.errors.passwordTooShort)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('does not call the API with a malformed email', async () => {
    renderPage()
    fillForm({ email: 'no-es-un-mail' })

    expect(await screen.findByText(authContent.errors.emailInvalid)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('reports that the request is pending approval once it went through', () => {
    mockRegister({ isSuccess: true })
    renderPage()

    expect(screen.getByText(authContent.register.sent.title)).toBeInTheDocument()
    expect(screen.getByText(authContent.register.sent.body)).toBeInTheDocument()
  })

  // El 202 es el mismo si el email ya tenía cuenta, así que la pantalla de
  // éxito no puede afirmar que la cuenta se creó.
  it('does not claim the account was created', () => {
    mockRegister({ isSuccess: true })
    renderPage()

    expect(
      screen.queryByRole('button', { name: authContent.register.submit }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(authContent.register.sent.body)).toHaveTextContent(
      /pendiente de aprobación/i,
    )
  })

  it('shows what the server objected to', () => {
    const error: ApiRequestError = new Error('Email is invalid')
    error.status = 422
    mockRegister({ error })
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Email is invalid')
  })

  it('offers the way back to the login', () => {
    renderPage()

    expect(screen.getByRole('link', { name: authContent.register.toLogin })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
