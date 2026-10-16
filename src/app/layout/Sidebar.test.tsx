import { fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useUiStore } from 'shared/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../test/renderWithTheme'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

// El panel de actividad cuelga del Header y consulta la API: acá no interesa.
vi.mock('shared/hooks/useActivity', () => ({
  useActivity: () => ({ data: [], isPending: false, isError: false, refetch: vi.fn() }),
}))

const HAMBURGER = { name: 'Alternar navegación lateral' }
const ORDERS_LINK = { name: 'Órdenes' }

/**
 * Simula el ancho de la pantalla. jsdom no trae `matchMedia`, y sin él
 * `useMediaQuery` cae siempre en «no coincide», o sea pantalla ancha. Se
 * contesta igual para cualquier query porque la única que hace la app acá es
 * la de `useSidebar` (debajo de `lg`).
 */
function screenIs(width: 'narrow' | 'wide') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: width === 'narrow',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function renderShell() {
  return renderWithTheme(
    <MemoryRouter>
      <Header />
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    // El store es un módulo: lo que un caso abre o cierra le llegaría al siguiente.
    useUiStore.setState({ sidebarOpen: true, floatingSidebarOpen: false })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('on wide screens', () => {
    beforeEach(() => screenIs('wide'))

    it('is docked and open from the start', () => {
      renderShell()

      const link = screen.getByRole('link', ORDERS_LINK)
      expect(link).toBeVisible()
      // Fija al costado: no es un modal con scrim encima del contenido.
      expect(link.closest('[role="presentation"]')).toBeNull()
    })

    it('stays open after choosing a section', () => {
      renderShell()

      fireEvent.click(screen.getByRole('link', ORDERS_LINK))

      expect(screen.getByRole('link', ORDERS_LINK)).toBeVisible()
    })

    it('closes the docked sidebar from the hamburger', () => {
      renderShell()

      fireEvent.click(screen.getByRole('button', HAMBURGER))

      expect(useUiStore.getState().sidebarOpen).toBe(false)
    })
  })

  describe('on narrow screens', () => {
    beforeEach(() => screenIs('narrow'))

    // A 800×600 la sidebar fija dejaba 545px de contenido: arranca cerrada
    // aunque la fija esté abierta.
    it('starts closed', () => {
      renderShell()

      expect(screen.queryByRole('link', ORDERS_LINK)).not.toBeInTheDocument()
    })

    it('opens floating over the content from the hamburger', () => {
      renderShell()

      fireEvent.click(screen.getByRole('button', HAMBURGER))

      const link = screen.getByRole('link', ORDERS_LINK)
      expect(link).toBeVisible()
      // Flotante: vive en el modal del drawer `temporary`, con su scrim.
      expect(link.closest('[role="presentation"]')).not.toBeNull()
    })

    // Los dos modos tienen estado propio: abrir y cerrar la flotante no puede
    // dejar cerrada a la fija para cuando la pantalla vuelva a ser ancha.
    //
    // Se cierra con Escape y no con la hamburguesa: con el modal abierto MUI
    // esconde el resto de la app al lector de pantalla (`aria-hidden`), y el
    // teclado sale del panel por ahí.
    it('leaves the docked sidebar as it was', () => {
      renderShell()

      fireEvent.click(screen.getByRole('button', HAMBURGER))
      fireEvent.keyDown(screen.getByRole('link', ORDERS_LINK), { key: 'Escape' })

      expect(useUiStore.getState().floatingSidebarOpen).toBe(false)
      expect(useUiStore.getState().sidebarOpen).toBe(true)
    })

    it('closes after choosing a section', async () => {
      renderShell()
      fireEvent.click(screen.getByRole('button', HAMBURGER))

      fireEvent.click(screen.getByRole('link', ORDERS_LINK))

      await waitFor(() => expect(screen.queryByRole('link', ORDERS_LINK)).not.toBeInTheDocument())
    })

    it('closes when the scrim outside it is clicked', async () => {
      renderShell()
      fireEvent.click(screen.getByRole('button', HAMBURGER))

      // El scrim no tiene rol ni texto (es `aria-hidden`): se lo busca por su clase.
      const scrim = document.querySelector('.MuiBackdrop-root')
      expect(scrim).not.toBeNull()
      fireEvent.click(scrim as Element)

      await waitFor(() => expect(screen.queryByRole('link', ORDERS_LINK)).not.toBeInTheDocument())
    })
  })
})
