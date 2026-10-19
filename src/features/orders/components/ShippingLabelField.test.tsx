import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { notify } from 'shared/store'
import type * as sharedStore from 'shared/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'
import * as api from '../api'
import { LABEL_URL_LIFETIME_MS } from '../hooks/useShipmentLabel'
import type { Shipment } from '../types'

import { ShippingLabelField } from './ShippingLabelField'

vi.mock('shared/store', async (importOriginal) => ({
  ...(await importOriginal<typeof sharedStore>()),
  notify: vi.fn(),
}))

const DISPATCHED: Shipment = {
  id: 31,
  orderId: 8829,
  status: 'in_transit',
  trackingNumber: 'OCA-0012345678',
  shippingCost: 58300,
  courier: { id: 4, serviceId: 7, name: 'OCA' },
  labelUrl: null,
  labelAvailable: true,
  externalReference: '0012345678',
  events: [],
}

const PENDING: Shipment = {
  ...DISPATCHED,
  status: 'pending',
  trackingNumber: null,
  shippingCost: null,
  courier: null,
  labelAvailable: false,
  externalReference: null,
}

const COURIER_URL = 'https://andreani.test/etiquetas/AND-9920.pdf'
const PDF = new Blob(['%PDF-1.4'], { type: 'application/pdf' })

// La pestaña que se abre en el clic y se completa cuando llega la etiqueta.
interface FakeTab {
  location: { href: string }
  opener: unknown
  close: ReturnType<typeof vi.fn>
}

let tab: FakeTab

function renderField(shipment: Shipment | null) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return renderWithTheme(
    <QueryClientProvider client={queryClient}>
      <ShippingLabelField shipment={shipment} />
    </QueryClientProvider>,
  )
}

const printButton = () => screen.queryByRole('button', { name: 'Imprimir etiqueta' })

function clickPrint() {
  const button = printButton()
  if (button === null) throw new Error('no print button')
  fireEvent.click(button)
}

function failWith(status: number | undefined) {
  return vi
    .spyOn(api, 'fetchShipmentLabel')
    .mockRejectedValue(Object.assign(new Error('falló'), { status }))
}

beforeEach(() => {
  tab = { location: { href: '' }, opener: window, close: vi.fn() }
  vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window)
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/etiqueta')
  URL.revokeObjectURL = vi.fn()
  vi.mocked(notify).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('ShippingLabelField', () => {
  // La emite el courier al confirmar el despacho: antes de eso no existe, y un
  // campo vacío se leería como un dato perdido.
  it('says it is pending while the shipment was not dispatched', () => {
    renderField(PENDING)

    expect(screen.getByText('Se emite al despachar.')).toBeInTheDocument()
    expect(printButton()).not.toBeInTheDocument()
  })

  it('says the same while there is no shipment at all', () => {
    renderField(null)

    expect(screen.getByText('Se emite al despachar.')).toBeInTheDocument()
  })

  // Despachado y sin etiqueta es otra cosa: el courier no la emite, y un botón
  // que contesta 404 sería peor que decirlo.
  it('offers no print when the api says there is no label', () => {
    renderField({ ...DISPATCHED, labelAvailable: false })

    expect(screen.getByText('El operador no devolvió la etiqueta.')).toBeInTheDocument()
    expect(printButton()).not.toBeInTheDocument()
  })

  // El endpoint pide el JWT: no puede ser un enlace.
  it('is a button and not a link to the courier', () => {
    renderField({ ...DISPATCHED, labelUrl: COURIER_URL })

    expect(printButton()).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('downloads the label of the shipment and opens the pdf in the tab it opened', async () => {
    const fetchLabel = vi.spyOn(api, 'fetchShipmentLabel').mockResolvedValue(PDF)
    renderField(DISPATCHED)

    clickPrint()

    // La pestaña se abre en el clic: después de esperar al courier el
    // navegador la bloquearía como popup.
    expect(window.open).toHaveBeenCalledWith('', '_blank')
    await waitFor(() => expect(tab.location.href).toBe('blob:http://localhost/etiqueta'))
    expect(fetchLabel).toHaveBeenCalledWith(31)
    expect(URL.createObjectURL).toHaveBeenCalledWith(PDF)
    expect(notify).not.toHaveBeenCalled()
  })

  // OCA puede tardar: si en ese rato el operador se va de la pantalla, la
  // pestaña igual recibe la etiqueta, y no queda vacía para siempre.
  it('fills the tab even if the screen was left while the courier answered', async () => {
    let answer: (pdf: Blob) => void = () => undefined
    vi.spyOn(api, 'fetchShipmentLabel').mockReturnValue(
      new Promise<Blob>((resolve) => (answer = resolve)),
    )
    const { unmount } = renderField(DISPATCHED)
    clickPrint()

    unmount()
    answer(PDF)

    await waitFor(() => expect(tab.location.href).toBe('blob:http://localhost/etiqueta'))
  })

  it('closes the tab and warns even if the screen was left while the api answered', async () => {
    failWith(404)
    const { unmount } = renderField(DISPATCHED)
    clickPrint()
    unmount()

    await waitFor(() => expect(tab.close).toHaveBeenCalled())
    expect(notify).toHaveBeenCalledWith('El envío no tiene una etiqueta para imprimir.', 'error')
  })

  it('frees the pdf once the tab had time to load it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.spyOn(api, 'fetchShipmentLabel').mockResolvedValue(PDF)
    renderField(DISPATCHED)

    clickPrint()
    await waitFor(() => expect(tab.location.href).not.toBe(''))

    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(LABEL_URL_LIFETIME_MS)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/etiqueta')
  })

  it('opens the pdf in a new tab when the browser blocked the empty one', async () => {
    vi.mocked(window.open).mockReturnValue(null)
    vi.spyOn(api, 'fetchShipmentLabel').mockResolvedValue(PDF)
    renderField(DISPATCHED)

    clickPrint()

    await waitFor(() =>
      expect(window.open).toHaveBeenLastCalledWith('blob:http://localhost/etiqueta', '_blank'),
    )
  })

  it('holds the button while the courier issues the label', async () => {
    vi.spyOn(api, 'fetchShipmentLabel').mockReturnValue(new Promise(() => {}))
    renderField(DISPATCHED)

    clickPrint()

    await waitFor(() => expect(printButton()).toBeDisabled())
  })

  // El backend redirigió a la URL del courier y lo que volvió no es un PDF:
  // esa URL es la etiqueta.
  it('opens the courier url when the redirect did not end in a pdf', async () => {
    vi.spyOn(api, 'fetchShipmentLabel').mockResolvedValue(null)
    renderField({ ...DISPATCHED, labelUrl: COURIER_URL })

    clickPrint()

    await waitFor(() => expect(tab.location.href).toBe(COURIER_URL))
    expect(tab.opener).toBeNull()
  })

  // Otro dominio sin CORS: el navegador no deja leer la respuesta, y el
  // cliente HTTP lo reporta sin status.
  it('opens the courier url when the redirect could not be read', async () => {
    failWith(undefined)
    renderField({ ...DISPATCHED, labelUrl: COURIER_URL })

    clickPrint()

    await waitFor(() => expect(tab.location.href).toBe(COURIER_URL))
    expect(notify).not.toHaveBeenCalled()
  })

  it('blames the courier when what came back is not a pdf and there is no url', async () => {
    vi.spyOn(api, 'fetchShipmentLabel').mockResolvedValue(null)
    renderField(DISPATCHED)

    clickPrint()

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        'El operador no devolvió la etiqueta. Probá de nuevo en unos minutos.',
        'error',
      ),
    )
    expect(tab.close).toHaveBeenCalled()
  })

  it('closes the tab and says there is no label when the api answers 404', async () => {
    failWith(404)
    renderField(DISPATCHED)

    clickPrint()

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith('El envío no tiene una etiqueta para imprimir.', 'error'),
    )
    expect(tab.close).toHaveBeenCalled()
  })

  it('blames the courier when the api answers 502', async () => {
    failWith(502)
    renderField({ ...DISPATCHED, labelUrl: COURIER_URL })

    clickPrint()

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        'El operador no devolvió la etiqueta. Probá de nuevo en unos minutos.',
        'error',
      ),
    )
    expect(tab.close).toHaveBeenCalled()
    expect(tab.location.href).toBe('')
  })
})
