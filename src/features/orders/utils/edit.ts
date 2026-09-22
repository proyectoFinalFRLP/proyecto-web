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

/** Un producto y un depósito que no alcanza para lo que las líneas piden. */
export interface StockShortfall {
  /** Producto y depósito, para usar como clave de lista. */
  key: string
  sku: string
  warehouseId: number
  /** Cuántas unidades más pide el grupo de las que hay libres. */
  missing: number
  /** Cuántas líneas del grupo hay en el formulario. */
  lines: number
  /** Las líneas que aumentaron: las únicas sobre las que se puede actuar. */
  lineKeys: string[]
}

/**
 * Lo que falta para que las líneas entren en el stock de su depósito, un
 * elemento por grupo de producto y depósito.
 *
 * La cuenta es por grupo y no por línea, y es la misma que hace el backend: lo
 * que la orden ya tenía descontado vuelve antes de descontar lo nuevo. Por eso
 * una línea que sube puede usar las unidades que libera otra del mismo producto
 * que baja —o que se quita— en el mismo depósito, y lo que se compara contra el
 * stock libre es el neto del grupo: cantidades actuales menos las originales,
 * incluidas las de las líneas quitadas.
 *
 * Como el que no entra es el grupo, el faltante es del grupo y así se dice en
 * pantalla. `lineKeys`, en cambio, trae sólo las líneas que **aumentaron**: una
 * línea que bajó puede estar en un grupo que no entra, y marcarla en rojo sería
 * acusarla de algo que no hizo — el operador miraría la fila equivocada.
 *
 * Sin el stock de un producto todavía cargado, su grupo no se marca: el backend
 * tiene la última palabra, y un aviso sin datos sería adivinar.
 */
export function stockShortfalls(
  lines: EditLine[],
  removed: EditLine[],
  stocks: ProductStockByWarehouse[],
): StockShortfall[] {
  const free = new Map(stocks.map((stock) => [stock.productId, stock.quantities]))
  const net = new Map<string, number>()

  const add = (line: EditLine, delta: number) => {
    if (line.warehouseId === null) return
    const key = groupKey(line.productId, line.warehouseId)
    net.set(key, (net.get(key) ?? 0) + delta)
  }

  lines.forEach((line) => add(line, lineQuantity(line) - line.originalQuantity))
  removed.forEach((line) => add(line, -line.originalQuantity))

  return groupsOf(lines).flatMap((group) => {
    const quantities = free.get(group.productId)
    if (quantities === undefined) return []

    const missing = (net.get(group.key) ?? 0) - (quantities[group.warehouseId] ?? 0)
    if (missing <= 0) return []

    return [
      {
        key: group.key,
        sku: group.sku,
        warehouseId: group.warehouseId,
        missing,
        lines: group.lines.length,
        lineKeys: group.lines
          .filter((line) => lineQuantity(line) > line.originalQuantity)
          .map((line) => line.key),
      },
    ]
  })
}

/** Una cantidad a medio tipear (`NaN`) cuenta como cero, no como el original. */
function lineQuantity(line: EditLine): number {
  return Number.isFinite(line.quantity) ? line.quantity : 0
}

interface EditLineGroup {
  key: string
  productId: number
  warehouseId: number
  sku: string
  lines: EditLine[]
}

// Las líneas agrupadas por producto y depósito, en el orden en que aparecen.
// Las anteriores a TESIS-126 quedan afuera: no tienen depósito contra el cual
// medir, y su cantidad no se puede cambiar.
function groupsOf(lines: EditLine[]): EditLineGroup[] {
  const groups = new Map<string, EditLineGroup>()

  lines.forEach((line) => {
    if (line.warehouseId === null) return

    const key = groupKey(line.productId, line.warehouseId)
    const group = groups.get(key) ?? {
      key,
      productId: line.productId,
      warehouseId: line.warehouseId,
      sku: line.sku,
      lines: [],
    }
    group.lines.push(line)
    groups.set(key, group)
  })

  return [...groups.values()]
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
