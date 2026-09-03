import { beforeEach, describe, expect, it, vi } from 'vitest'

import { sessionToken, tokenWith } from '../../test/tokens'

// El store se rehidrata de localStorage en el momento en que se crea, así que
// cada caso tiene que sembrar el storage y recién después importar el módulo.
async function loadStore() {
  vi.resetModules()
  const [{ useAuthStore, getAuthToken }, { queryClient }] = await Promise.all([
    import('./authStore'),
    import('../api/queryClient'),
  ])

  return { useAuthStore, getAuthToken, queryClient }
}

function persist(state: unknown, version = 1) {
  localStorage.setItem('auth-store', JSON.stringify({ state, version }))
}

beforeEach(() => {
  localStorage.clear()
})

describe('login', () => {
  it('opens the session with the identity that travels in the token', async () => {
    const { useAuthStore } = await loadStore()

    const ok = useAuthStore.getState().login(sessionToken({ userId: 7, companyId: 3 }), 'a@b.com')

    expect(ok).toBe(true)
    expect(useAuthStore.getState().user).toEqual({ id: 7, companyId: 3, email: 'a@b.com' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  // Devuelve false en vez de lanzar para que la pantalla de login pueda avisar.
  it('refuses an already expired token', async () => {
    const { useAuthStore } = await loadStore()

    const ok = useAuthStore.getState().login(sessionToken({ expiresInMs: -1000 }), 'a@b.com')

    expect(ok).toBe(false)
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null })
  })

  it('refuses a token that is not a JWT', async () => {
    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState().login('garbage', 'a@b.com')).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('logout', () => {
  it('empties the session', async () => {
    const { useAuthStore } = await loadStore()
    useAuthStore.getState().login(sessionToken(), 'a@b.com')

    useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  })

  // La cache de React Query es por tenant: el JWT lleva company_id, así que
  // dejarla viva le mostraría al próximo usuario los datos de la empresa
  // anterior hasta el primer refetch.
  it('drops the cached data of the tenant that is leaving', async () => {
    const { useAuthStore, queryClient } = await loadStore()
    useAuthStore.getState().login(sessionToken(), 'a@b.com')
    queryClient.setQueryData(['products'], [{ id: 1, name: 'Cable UTP Cat6' }])

    useAuthStore.getState().logout()

    expect(queryClient.getQueryData(['products'])).toBeUndefined()
  })
})

describe('rehydration from localStorage', () => {
  it('restores the session from a live token', async () => {
    persist({ token: sessionToken({ userId: 7, companyId: 3 }), email: 'a@b.com' })

    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState().user).toEqual({ id: 7, companyId: 3, email: 'a@b.com' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  // Sin esto la app arrancaría mostrándose autenticada con una credencial que
  // el backend va a rechazar en el primer request.
  it('does not restore a session whose token already expired', async () => {
    persist({ token: sessionToken({ expiresInMs: -1000 }), email: 'a@b.com' })

    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState()).toMatchObject({ token: null, isAuthenticated: false })
  })

  it.each([
    ['a token that is not a string', { token: 123, email: 'a@b.com' }],
    ['an object with no token', { email: 'a@b.com' }],
    ['an empty object', {}],
    ['null', null],
    ['a string instead of an object', 'auth'],
  ])('starts logged out when the stored value is %s', async (_name, stored) => {
    persist(stored)

    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  // Forma vieja: se persistía sólo el token. Vale como sesión — el email es lo
  // único que se pierde, y es lo único que no viaja en el JWT.
  it('restores a session persisted without the email', async () => {
    persist({ token: sessionToken({ userId: 7, companyId: 3 }) })

    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState().user).toEqual({ id: 7, companyId: 3, email: '' })
  })

  it('ignores a token whose payload is missing the claims the UI needs', async () => {
    persist({ token: tokenWith({ user_id: 7 }), email: 'a@b.com' })

    const { useAuthStore } = await loadStore()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('getAuthToken', () => {
  // El interceptor HTTP lo lee desde afuera de React. Que salga del store y no
  // de localStorage es lo que evita que haya dos fuentes de verdad.
  it('reports the token the store holds', async () => {
    const { useAuthStore, getAuthToken } = await loadStore()
    const token = sessionToken()

    expect(getAuthToken()).toBeNull()

    useAuthStore.getState().login(token, 'a@b.com')
    expect(getAuthToken()).toBe(token)

    useAuthStore.getState().logout()
    expect(getAuthToken()).toBeNull()
  })
})
