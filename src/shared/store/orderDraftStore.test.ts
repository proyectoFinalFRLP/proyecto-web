import { beforeEach, describe, expect, it } from 'vitest'

import { useOrderDraftStore } from './orderDraftStore'
import type { OrderDraftItem } from './orderDraftStore'

function item(overrides: Partial<OrderDraftItem> = {}): OrderDraftItem {
  return {
    productId: 12,
    sku: 'PX-9021-LRG',
    name: 'Router industrial de alta densidad',
    category: 'Electronics',
    weight: 1.2,
    unitPrice: 120000,
    quantity: 12,
    ...overrides,
  }
}

beforeEach(() => {
  useOrderDraftStore.getState().clearDraft()
  sessionStorage.clear()
})

describe('addItem', () => {
  it('appends a product that is not in the draft yet', () => {
    const { addItem } = useOrderDraftStore.getState()

    addItem(item({ productId: 1 }))
    addItem(item({ productId: 2 }))

    expect(useOrderDraftStore.getState().items.map((row) => row.productId)).toEqual([1, 2])
  })

  // Un SKU es una sola fila: volver a agregarlo pisa cantidad y precio en vez
  // de duplicar la línea, y la fila no cambia de lugar.
  it('replaces the line in place when the product was already added', () => {
    const { addItem } = useOrderDraftStore.getState()

    addItem(item({ productId: 1, quantity: 2 }))
    addItem(item({ productId: 2 }))
    addItem(item({ productId: 1, quantity: 9, unitPrice: 500 }))

    const { items } = useOrderDraftStore.getState()

    expect(items.map((row) => row.productId)).toEqual([1, 2])
    expect(items[0]).toMatchObject({ quantity: 9, unitPrice: 500 })
  })
})

describe('updateItem', () => {
  it('changes only the line of that product', () => {
    const { addItem, updateItem } = useOrderDraftStore.getState()
    addItem(item({ productId: 1, quantity: 2 }))
    addItem(item({ productId: 2, quantity: 5 }))

    updateItem(1, { quantity: 7 })

    const { items } = useOrderDraftStore.getState()

    expect(items[0].quantity).toBe(7)
    expect(items[1].quantity).toBe(5)
  })
})

describe('removeItem', () => {
  it('drops the line of that product and keeps the rest', () => {
    const { addItem, removeItem } = useOrderDraftStore.getState()
    addItem(item({ productId: 1 }))
    addItem(item({ productId: 2 }))

    removeItem(1)

    expect(useOrderDraftStore.getState().items.map((row) => row.productId)).toEqual([2])
  })
})

const DESTINATION = {
  address: 'Av. Corrientes 3247, piso 5',
  city: 'CABA',
  province: 'Ciudad Autónoma de Buenos Aires',
  zipCode: '1193',
}

describe('origin and destination', () => {
  it('keeps the warehouse and the delivery address chosen in step 2', () => {
    const { setOrigin, setDestination } = useOrderDraftStore.getState()

    setOrigin({ warehouseId: 3, name: 'CD Ezeiza' })
    setDestination(DESTINATION)

    expect(useOrderDraftStore.getState()).toMatchObject({
      origin: { warehouseId: 3, name: 'CD Ezeiza' },
      destination: DESTINATION,
    })
  })

  // Si el paso 1 cambia las líneas, el depósito elegido puede dejar de cubrirlas:
  // el paso 2 lo descarta con `setOrigin(null)` en vez de arrastrarlo.
  it('lets step 2 forget the warehouse', () => {
    const { setOrigin } = useOrderDraftStore.getState()
    setOrigin({ warehouseId: 3, name: 'CD Ezeiza' })

    setOrigin(null)

    expect(useOrderDraftStore.getState().origin).toBeNull()
  })

  it('survives a reload between steps', () => {
    useOrderDraftStore.getState().setDestination(DESTINATION)

    const stored = JSON.parse(sessionStorage.getItem('order-draft-store') ?? '{}')

    expect(stored.state.destination).toEqual(DESTINATION)
  })
})

describe('clearDraft', () => {
  it('forgets origin and destination too', () => {
    const { setOrigin, setDestination, clearDraft } = useOrderDraftStore.getState()
    setOrigin({ warehouseId: 3, name: 'CD Ezeiza' })
    setDestination(DESTINATION)

    clearDraft()

    expect(useOrderDraftStore.getState()).toMatchObject({ origin: null, destination: null })
  })

  it('forgets the customer and the lines', () => {
    const { addItem, setCustomer, clearDraft } = useOrderDraftStore.getState()
    setCustomer({ firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' })
    addItem(item())

    clearDraft()

    expect(useOrderDraftStore.getState()).toMatchObject({ customer: null, items: [] })
  })
})

// Los tres pasos son tres rutas y el borrador tiene que sobrevivir un reload
// entre una y otra, pero sin quedar guardado para siempre: por eso la sesión.
it('persists the draft in the session storage, not in the local one', () => {
  useOrderDraftStore
    .getState()
    .setCustomer({ firstName: 'Marina', lastName: 'Rodríguez', document: '20-31298744-9' })

  const stored = sessionStorage.getItem('order-draft-store')

  expect(stored).not.toBeNull()
  expect(JSON.parse(stored ?? '{}').state.customer.firstName).toBe('Marina')
  expect(localStorage.getItem('order-draft-store')).toBeNull()
})
