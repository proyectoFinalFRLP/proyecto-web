/**
 * Cómo se nombra una orden en cualquier pantalla: el listado de órdenes, el
 * panel, el detalle y el listado de envíos (TESIS-181).
 *
 * Se prefiere el identificador del canal externo, que es con el que el operador
 * conoce la venta y con el que la va a buscar. Las ventas cargadas a mano no
 * tienen uno, y ahí se cae al id interno para que nunca quede vacío.
 *
 * Vive en `shared` porque la usan tres features: cuando cada una tenía su
 * copia, envíos armaba la suya con el id interno y la misma venta aparecía con
 * dos números según la pantalla.
 */
export function formatOrderId(externalOrderId: string | null, id: number): string {
  return `#${externalOrderId ?? id}`
}
