import { ordersCopy } from '../../content'
import { isDraftItemValid } from '../../utils/draft'

import { QuantityInput } from './DraftItemsTable.styles'
import type { QuantityCellProps } from './DraftItemsTable.types'

const { products: copy } = ordersCopy.draft

// La fuente del root la hereda el `<input>`: el número queda en la mono del DS.
const MONO = { typography: 'dataMono' }

/**
 * La cantidad de una línea, editable en la propia fila: el diseño dice que
 * «las cantidades ajustan el peso estimado», y ajustarlas quitando y volviendo
 * a agregar el SKU no es ajustar.
 *
 * Un valor vacío o en cero llega al borrador como está (NaN o 0) y la fila se
 * marca en error: borrar la línea a medio tipear sería peor que verla en rojo.
 */
export function QuantityCell({ item, onChange }: QuantityCellProps) {
  const invalid = !isDraftItemValid(item)

  return (
    <QuantityInput
      type="number"
      size="small"
      // `isFinite` y no `isNaN`: un borrador rehidratado de la sesión trae
      // `null` donde había un NaN (JSON no lo representa), y también es vacío.
      value={Number.isFinite(item.quantity) ? item.quantity : ''}
      onChange={(event) => onChange(Number(event.target.value || Number.NaN))}
      error={invalid}
      slotProps={{
        input: { sx: MONO },
        htmlInput: { min: 1, step: 1, 'aria-label': copy.quantityFor(item.sku) },
      }}
    />
  )
}
