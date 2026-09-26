import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { IconButton } from '@mui/material'

import { ordersCopy } from '../../content'

import { StepperInput, StepperRoot } from './EditLinesTable.styles'
import type { QuantityStepperProps } from './EditLinesTable.types'

const { lines: copy } = ordersCopy.edit

// La fuente del root la hereda el `<input>`: el número queda en la mono del DS.
const MONO = { typography: 'dataMono' }

/**
 * El selector de cantidad `−` / `+` que pide la card, con el campo en el medio
 * para tipear un número grande sin cien clics.
 *
 * `−` se apaga en 1: una línea en cero no es una línea, y para sacarla está
 * «Quitar». Un campo vacío llega como `NaN` y la fila se marca en error en vez
 * de borrarse a medio tipear, igual que en el paso 1 del alta.
 */
export function QuantityStepper({ line, invalid, disabled, onChange }: QuantityStepperProps) {
  const current = Number.isFinite(line.quantity) ? line.quantity : 0

  return (
    <StepperRoot>
      <IconButton
        size="small"
        aria-label={copy.decrease(line.sku)}
        disabled={disabled || current <= 1}
        onClick={() => onChange(current - 1)}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <StepperInput
        type="number"
        size="small"
        value={Number.isFinite(line.quantity) ? line.quantity : ''}
        onChange={(event) => onChange(Number(event.target.value || Number.NaN))}
        error={invalid}
        disabled={disabled}
        slotProps={{
          input: { sx: MONO },
          htmlInput: { min: 1, step: 1, 'aria-label': copy.quantityFor(line.sku) },
        }}
      />
      <IconButton
        size="small"
        aria-label={copy.increase(line.sku)}
        disabled={disabled}
        onClick={() => onChange(current + 1)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </StepperRoot>
  )
}
