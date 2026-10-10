import type { DeleteBlocker } from '../types'

// El 409 de la baja trae el motivo en inglés y en el texto, no en un código:
// `Cannot delete warehouse with existing stock` / `... order lines taken from
// it` / `... stock transfers from or to it` (`WarehousesController#
// blocking_reason`). Se reconoce por fragmentos y no por la frase entera, para
// que un ajuste de redacción en el backend no lo rompa del todo; lo que no se
// reconoce cae en un motivo genérico, nunca en el texto crudo.
const FRAGMENTS: [fragment: string, blocker: DeleteBlocker][] = [
  ['transfer', 'transfers'],
  ['order', 'orders'],
  ['stock', 'stock'],
]

export function deleteBlockerFrom(message: string | undefined): DeleteBlocker {
  const text = (message ?? '').toLowerCase()

  return FRAGMENTS.find(([fragment]) => text.includes(fragment))?.[1] ?? 'unknown'
}
