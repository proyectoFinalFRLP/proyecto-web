import { describe, expect, it } from 'vitest'

import { navRoutes } from './routes'

const paths = navRoutes.map((route) => route.path)

describe('navRoutes', () => {
  // El panel es la pantalla de entrada desde TESIS-140: antes `/` era una
  // pantalla de Inicio sin datos y el panel vivía en `/dashboard`.
  it('opens the sidebar with the dashboard, which is the root of the app', () => {
    expect(navRoutes[0]).toMatchObject({ path: '/', nav: { label: 'Dashboard' } })
  })

  it('lists the sections of the product, and only those', () => {
    expect(paths).toEqual([
      '/',
      '/orders',
      '/shipments',
      '/inventory',
      '/warehouses',
      '/failed-events',
      '/reports',
    ])
  })

  // Integraciones se sacó en TESIS-140: las conexiones las administra el
  // equipo desde el backoffice, no la empresa desde la app.
  it('does not offer a section for the integrations of the company', () => {
    expect(paths).not.toContain('/integrations')
  })

  it('never lists a route that has no place in the sidebar', () => {
    expect(paths).not.toContain('/login')
    expect(paths).not.toContain('/design-system')
    expect(paths).not.toContain('/orders/new')
  })
})
