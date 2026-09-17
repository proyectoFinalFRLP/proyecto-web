import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/session', () => ({ fetchCurrentUser: vi.fn() }))

import { fetchCurrentUser } from '../api/session'
import { useAuthStore } from '../store'
import type { SessionUser } from '../store/authStore'

import { useSessionIdentity } from './useSessionIdentity'

const fetchMock = vi.mocked(fetchCurrentUser)

const USER: SessionUser = {
  id: 7,
  email: 'confirmado@acme.com',
  companyId: 3,
  companyName: 'Acme',
}

/**
 * Un cliente por ejemplo, y no el de `shared/api/queryClient`: la cache es
 * estado compartido, así que reusarlo haría que el segundo test leyera la
 * respuesta del primero en vez de pedirla.
 *
 * `retry: false` acá es el default del provider, el mismo que el de producción
 * en su intención. Lo que el ejemplo de reintentos prueba es que el hook no
 * dependa de eso: lo pide él, contra un provider que sí reintenta.
 */
function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function mount(options?: { retry?: number }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: options?.retry ?? false } },
  })

  return renderHook(() => useSessionIdentity(), { wrapper: wrapper(client) })
}

afterEach(() => {
  // El store es un singleton de módulo: sin esto la sesión de un ejemplo queda
  // abierta en el siguiente. Se escribe el estado en vez de llamar a `logout()`,
  // que además dispara la revocación contra el backend.
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  vi.clearAllMocks()
})

describe('useSessionIdentity', () => {
  it('does not ask who the user is when there is no session', () => {
    mount()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('resolves the identity into the store while there is a token', async () => {
    fetchMock.mockResolvedValue(USER)
    useAuthStore.setState({ token: 'un-token', isAuthenticated: true })

    mount()

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(USER)
    })
  })

  /**
   * El caso que motiva que la identidad no se persista: al rehidratar desde
   * `localStorage` hay token pero no usuario, y quién es lo contesta `GET /me`.
   */
  it('fills a session rehydrated with a token and no user', async () => {
    fetchMock.mockResolvedValue(USER)
    useAuthStore.setState({ token: 'un-token', user: null, isAuthenticated: true })

    const { result } = mount()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(useAuthStore.getState().user?.email).toBe('confirmado@acme.com')
  })

  /**
   * Un token válido de un usuario borrado responde 401. Reintentarlo no lo va a
   * arreglar, y de limpiar la sesión se encarga el interceptor del cliente.
   */
  it('does not retry when the backend rejects the token', async () => {
    fetchMock.mockRejectedValue(new Error('Unauthorized'))
    useAuthStore.setState({ token: 'un-token', isAuthenticated: true })

    const { result } = mount({ retry: 3 })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('leaves the user empty when the identity could not be read', async () => {
    fetchMock.mockRejectedValue(new Error('Unauthorized'))
    useAuthStore.setState({ token: 'un-token', isAuthenticated: true })

    const { result } = mount()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(useAuthStore.getState().user).toBeNull()
  })
})
