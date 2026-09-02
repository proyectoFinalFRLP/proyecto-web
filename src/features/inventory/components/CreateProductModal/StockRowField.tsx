import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { IconButton } from '@mui/material'

import { LabeledField } from '../ProductModalShell'

import { StockQuantity, StockRow, StockWarehouse } from './CreateProductModal.styles'
import type { StockRowFieldProps } from './CreateProductModal.types'

/**
 * Fila de stock inicial: depósito + cantidad.
 *
 * El frame dibuja una sola fila y no muestra cómo se quita. Como el botón
 * "Agregar depósito" permite sumar filas, hace falta poder deshacerlo: la
 * papelera aparece desde la segunda en adelante, así siempre queda al menos un
 * depósito y no hace falta un estado vacío que el diseño no contempla.
 */
export function StockRowField({
  warehouseLabel,
  quantityLabel,
  warehouseField,
  quantityField,
  warehouseError,
  quantityError,
  onRemove,
  removeLabel,
}: StockRowFieldProps) {
  return (
    <StockRow>
      <StockWarehouse>
        <LabeledField label={warehouseLabel} error={warehouseError}>
          {warehouseField}
        </LabeledField>
      </StockWarehouse>

      <StockQuantity>
        <LabeledField label={quantityLabel} error={quantityError}>
          {quantityField}
        </LabeledField>
      </StockQuantity>

      {onRemove === undefined ? null : (
        <IconButton aria-label={removeLabel} onClick={onRemove} size="small" sx={{ mt: 3 }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </StockRow>
  )
}
