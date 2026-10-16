/**
 * Cómo se nombra una orden en cualquier pantalla: el listado de órdenes, el
 * panel, el detalle y el listado de envíos (TESIS-181).
 *
 * Se prefiere el número que la tienda le da a la venta (TESIS-180): en Shopify,
 * «#1001», el que ve el comerciante en su admin. Después, el identificador del
 * canal, y si la venta se cargó a mano y no tiene ninguno, el id interno, para
 * que nunca quede vacío. El número de Shopify ya trae el `#`: no se repite.
 *
 * Vive en `shared` porque la usan tres features: cuando cada una tenía su
 * copia, envíos armaba la suya con el id interno y la misma venta aparecía con
 * dos números según la pantalla.
 */
export function formatOrderId(
  externalOrderId: string | null,
  id: number,
  externalOrderNumber: string | null = null,
): string {
  const storeNumber = externalOrderNumber?.trim().replace(/^#/, '')
  return `#${storeNumber || externalOrderId || id}`
}
