import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import { IconButton } from '@mui/material'

import {
  QuantityError,
  QuantityField,
  QuantityLabel,
  WarehouseAddress,
  WarehouseIconBox,
  WarehouseInfo,
  WarehouseName,
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
        <WarehouseName variant="bodyMd">{name}</WarehouseName>
        <WarehouseAddress variant="labelMd">{address}</WarehouseAddress>
      </WarehouseInfo>

      <QuantityField as="label">
        <QuantityLabel variant="labelSm">{quantityLabel}</QuantityLabel>
        {children}
        {error === undefined ? null : (
          <QuantityError variant="labelSm" role="alert">
            {error}
          </QuantityError>
        )}
      </QuantityField>

      <IconButton aria-label={removeLabel} onClick={onRemove} size="small">
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </WarehouseRow>
  )
}
