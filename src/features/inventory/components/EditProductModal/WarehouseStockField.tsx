import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import { IconButton, Typography } from '@mui/material'

import {
  QuantityField,
  WarehouseIconBox,
  WarehouseInfo,
  WarehouseRow,
} from './EditProductModal.styles'
import type { WarehouseStockFieldProps } from './EditProductModal.types'

/**
 * Fila de asignación de stock: depósito + cantidad disponible + quitar.
 *
 * El frame dibuja un glifo distinto por depósito ("hub", "nodo"), pero son
 * ilustraciones de la muestra: `warehouses` no tiene campo de ícono en la API,
 * así que todas las filas usan el mismo y la identidad la da el nombre.
 */
export function WarehouseStockField({
  name,
  address,
  quantityLabel,
  removeLabel,
  error,
  onRemove,
  children,
}: WarehouseStockFieldProps) {
  return (
    <WarehouseRow>
      <WarehouseIconBox aria-hidden>
        <WarehouseIcon />
      </WarehouseIconBox>

      <WarehouseInfo>
        <Typography variant="bodyMd" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography variant="labelMd" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          {address}
        </Typography>
      </WarehouseInfo>

      <QuantityField as="label">
        <Typography
          variant="labelSm"
          sx={{ display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase' }}
        >
          {quantityLabel}
        </Typography>
        {children}
        {error === undefined ? null : (
          <Typography variant="labelSm" role="alert" sx={{ mt: 0.5, color: 'error.main' }}>
            {error}
          </Typography>
        )}
      </QuantityField>

      <IconButton aria-label={removeLabel} onClick={onRemove} size="small">
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </WarehouseRow>
  )
}
