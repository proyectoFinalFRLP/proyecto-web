import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Typography } from '@mui/material'

import { ordersCopy } from '../../content'
import { SelectableCard } from '../SelectableCard'

import { OriginColumn, OriginRow, OriginText } from './DispatchShipmentDialog.styles'
import type { OriginOptionsProps } from './DispatchShipmentDialog.types'

const { origin: copy } = ordersCopy.detail.dispatch

/**
 * Los depósitos candidatos como tarjetas elegibles, cuando el origen no se
 * puede deducir de las líneas. No es el selector del paso 2
 * (`OriginWarehousePicker`): aquél mide si cada depósito cubre el borrador, y
 * acá el stock de la orden ya se descontó.
 */
export function OriginOptions({
  warehouses,
  selectedId,
  onSelect,
  disabled = false,
}: OriginOptionsProps) {
  return (
    <OriginColumn role="radiogroup" aria-label={copy.title}>
      {warehouses.map((warehouse) => {
        const selected = warehouse.id === selectedId

        return (
          <SelectableCard
            key={warehouse.id}
            role="radio"
            aria-checked={selected}
            selected={selected}
            disabled={disabled}
            onClick={() => onSelect(warehouse)}
          >
            <OriginRow>
              <OriginText>
                <Typography variant="bodyLg" component="span" sx={{ fontWeight: 600 }}>
                  {warehouse.name}
                </Typography>
                <Typography variant="bodyMd" component="span" sx={{ color: 'text.secondary' }}>
                  {warehouse.address}
                </Typography>
              </OriginText>
              {selected ? (
                <CheckCircleIcon color="primary" aria-hidden />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: 'text.secondary' }} aria-hidden />
              )}
            </OriginRow>
          </SelectableCard>
        )
      })}
    </OriginColumn>
  )
}
