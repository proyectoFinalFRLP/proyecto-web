import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Borrador de la orden manual (S05 → S06 → S07). Cada paso del asistente lee y
// escribe acá; lo que se manda a `POST /orders` se arma recién al confirmar.
//
// Es un store y no estado de la página porque los tres pasos son tres rutas:
// al navegar del paso 1 al 2 la página del paso 1 se desmonta, y el borrador
// tiene que sobrevivirla. Persiste en `sessionStorage` y no en `localStorage`
// a propósito: un reload en el paso 2 no debería perder lo cargado, pero un
// borrador a medias tampoco tiene que reaparecer días después en otra pestaña.

/** Los datos del comprador que pide el paso 1. Nombre y apellido viajan separados
 *  hasta el envío, donde se unen en el `customer_name` que espera la API. */
export interface OrderDraftCustomer {
  firstName: string
  lastName: string
  document: string
}

/**
 * Una línea del borrador. Copia del producto lo que la pantalla muestra y lo
 * que el envío necesita, así el paso 2 y el 3 no tienen que volver a pedir el
 * catálogo para saber qué se vendió.
 */
export interface OrderDraftItem {
  productId: number
  sku: string
  name: string
  category: string | null
  /** Peso unitario en kg, para el estimado del envío. */
  weight: number
  unitPrice: number
  quantity: number
}

/**
 * El depósito del que sale la mercadería (paso 2). Uno solo para toda la orden:
 * es el `warehouse_id` que el paso 3 manda en cada línea de `POST /orders`, y
 * el `origin_warehouse_id` de la cotización. El nombre se copia para que el
 * paso 3 lo muestre sin volver a pedir los depósitos.
 */
export interface OrderDraftOrigin {
  warehouseId: number
  name: string
}

/**
 * El domicilio de entrega (paso 2), con los mismos cuatro datos que guarda la
 * orden: `customer_address`, `customer_city`, `customer_province` y
 * `customer_zip_code` (TESIS-128).
 */
export interface OrderDraftDestination {
  address: string
  city: string
  province: string
  zipCode: string
}

interface OrderDraftState {
  /** `null` hasta que el paso 1 se completa por primera vez. */
  customer: OrderDraftCustomer | null
  items: OrderDraftItem[]
  /** `null` hasta que el paso 2 elige un depósito. */
  origin: OrderDraftOrigin | null
  /** `null` hasta que el paso 2 se completa por primera vez. */
  destination: OrderDraftDestination | null
  setCustomer: (customer: OrderDraftCustomer) => void
  setOrigin: (origin: OrderDraftOrigin | null) => void
  setDestination: (destination: OrderDraftDestination) => void
  /** Suma la línea. Si el producto ya estaba, la reemplaza: un SKU es una sola fila. */
  addItem: (item: OrderDraftItem) => void
  updateItem: (
    productId: number,
    patch: Partial<Pick<OrderDraftItem, 'quantity' | 'unitPrice'>>,
  ) => void
  removeItem: (productId: number) => void
  /** Cancelar la orden, confirmarla o cerrar sesión: el borrador vuelve a cero. */
  clearDraft: () => void
}

const EMPTY_DRAFT = { customer: null, items: [], origin: null, destination: null }

export const useOrderDraftStore = create<OrderDraftState>()(
  persist(
    (set) => ({
      ...EMPTY_DRAFT,
      setCustomer: (customer) => set({ customer }),
      setOrigin: (origin) => set({ origin }),
      setDestination: (destination) => set({ destination }),
      addItem: (item) =>
        set((state) => {
          const index = state.items.findIndex((row) => row.productId === item.productId)
          if (index === -1) return { items: [...state.items, item] }

          // Se reemplaza en el mismo lugar y no al final: la fila no tiene que
          // saltar de posición porque se volvió a cargar.
          const items = [...state.items]
          items[index] = item
          return { items }
        }),
      updateItem: (productId, patch) =>
        set((state) => ({
          items: state.items.map((row) =>
            row.productId === productId ? { ...row, ...patch } : row,
          ),
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((row) => row.productId !== productId) })),
      clearDraft: () => set(EMPTY_DRAFT),
    }),
    {
      name: 'order-draft-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        customer: state.customer,
        items: state.items,
        origin: state.origin,
        destination: state.destination,
      }),
    },
  ),
)
