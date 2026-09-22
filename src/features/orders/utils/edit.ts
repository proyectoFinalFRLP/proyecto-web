import type {
  EditableOrderStatus,
  OrderDetail,
  ProductStockByWarehouse,
  UpdateOrderPayload,
} from '../types'

import { lineSubtotal } from './payment'

// Las reglas de la modificación de una orden (S09), fuera de los componentes
// para probarlas sin montar la pantalla.

/**
 * Una línea mientras se edita. Las que vienen de la orden conservan su `id` y la
 * cantidad con la que se leyeron; las agregadas en la pantalla no tienen `id` y
 * arrancan de cero, porque todavía no descontaron nada.
 */
export interface EditLine {
  /** Identidad estable para React: `line-<id>` o `new-<productId>`. */
  key: string
  id: number | null
  productId: number
  sku: string
  name: string
  unitPrice: number
  quantity: number
  /** La cantidad con la que la línea vino de la orden; 0 en una línea nueva. */
  originalQuantity: number
  /** De qué depósito sale (o salió) la línea. `null` en las líneas anteriores a TESIS-126. */
  warehouseId: number | null
}

/** Los datos del encabezado que edita la pantalla. */
export interface EditHeader {
  customerName: string
  customerDocument: string
  status: EditableOrderStatus
  address: string
  city: string
  province: string
  zipCode: string
}

export function toEditLines(order: OrderDetail): EditLine[] {
  return order.lines.map((line) => ({
    key: `line-${line.id}`,
    id: line.id,
    productId: line.productId,
    sku: line.sku,
    name: line.productName,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    originalQuantity: line.quantity,
    warehouseId: line.warehouseId,
  }))
}

/**
 * Una línea que existía antes de que la orden recordara el depósito de cada
 * línea (TESIS-126). El backend no sabe a qué depósito devolver sus unidades
 * ni de cuál tomar más, así que rechaza cambiar su cantidad o quitarla: la
 * pantalla la muestra fija en vez de dejar que el operador lo descubra al
 * guardar.
 */
export function isLocked(line: Pick<EditLine, 'id' | 'warehouseId'>): boolean {
  return line.id !== null && line.warehouseId === null
}

/** Una cantidad que se puede mandar: un entero de al menos una unidad. */
export function isQuantityValid(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1
}

function groupKey(productId: number, warehouseId: number): string {
  return `${productId}@${warehouseId}`
}

/**
 * Las líneas que piden más unidades de las que su depósito tiene.
 *
 * La cuenta es por producto y depósito, no por línea, y es la misma que hace el
 * backend: lo que la orden ya tenía descontado vuelve antes de descontar lo
 * nuevo. Por eso una línea que sube puede usar las unidades que libera otra del
 * mismo producto que baja —o que se quita— en el mismo depósito, y lo que se
 * compara contra el stock libre es el neto del grupo: cantidades actuales menos
 * las originales, incluidas las de las líneas quitadas.
 *
 * Devuelve las claves de las líneas del grupo que no alcanza. Sin el stock de un
 * producto todavía cargado, sus líneas no se marcan: el backend tiene la última
 * palabra, y un aviso sin datos sería adivinar.
 */
export function linesOverStock(
  lines: EditLine[],
  removed: EditLine[],
  stocks: ProductStockByWarehouse[],
): Set<string> {
  const free = new Map(stocks.map((stock) => [stock.productId, stock.quantities]))
  const net = new Map<string, number>()

  const add = (line: EditLine, delta: number) => {
    if (line.warehouseId === null) return
    const key = groupKey(line.productId, line.warehouseId)
    net.set(key, (net.get(key) ?? 0) + delta)
  }

  lines.forEach((line) =>
    add(line, (Number.isFinite(line.quantity) ? line.quantity : 0) - line.originalQuantity),
  )
  removed.forEach((line) => add(line, -line.originalQuantity))

  return new Set(
    lines
      .filter((line) => {
        if (line.warehouseId === null) return false
        const quantities = free.get(line.productId)
        if (quantities === undefined) return false

        const needed = net.get(groupKey(line.productId, line.warehouseId)) ?? 0
        return needed > (quantities[line.warehouseId] ?? 0)
      })
      .map((line) => line.key),
  )
}

/**
 * Si las líneas cambiaron respecto de la orden. Sin cambios, el guardado no
 * manda `items` y el backend no toca las líneas ni el stock: corregir una
 * dirección no tiene por qué tomar locks de productos.
 */
export function linesChanged(original: EditLine[], lines: EditLine[]): boolean {
  if (original.length !== lines.length) return true

  return lines.some((line) => {
    const before = original.find((candidate) => candidate.key === line.key)
    return before?.quantity !== line.quantity
  })
}

/** Lo que suman las líneas editadas, en centavos por debajo como el resto de la feature. */
export function editSubtotal(lines: EditLine[]): number {
  const cents = lines
    .filter((line) => Number.isFinite(line.quantity))
    .reduce((sum, line) => sum + Math.round(lineSubtotal(line) * 100), 0)
  return cents / 100
}

/**
 * El body del `PUT`. Las líneas van sólo si cambiaron, y cuando van, van todas:
 * el backend borra las que no vienen. Una existente manda su `id` y la cantidad
 * nueva —el precio facturado no se toca—; una nueva manda los cuatro datos del
 * alta.
 */
export function toUpdatePayload(
  header: EditHeader,
  lines: EditLine[],
  includeLines: boolean,
): UpdateOrderPayload {
  const order: UpdateOrderPayload['order'] = {
    customer_name: header.customerName.trim(),
    customer_document: header.customerDocument.trim(),
    customer_address: header.address.trim(),
    customer_city: header.city.trim(),
    customer_province: header.province,
    customer_zip_code: header.zipCode.trim(),
    status: header.status,
  }

  if (!includeLines) return { order }

  return {
    order: {
      ...order,
      items: lines.map((line) =>
        line.id === null ? newLineItem(line) : { id: line.id, quantity: line.quantity },
      ),
    },
  }
}

// Una línea nueva siempre nace con depósito: la pantalla no deja agregarla sin
// elegirlo. Si llegara acá sin uno es un bug, y mandarla con un depósito
// inventado lo escondería detrás de un 422.
function newLineItem(line: EditLine) {
  if (line.warehouseId === null) throw new Error(`New line ${line.sku} has no warehouse`)

  return {
    product_id: line.productId,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    warehouse_id: line.warehouseId,
  }
}
