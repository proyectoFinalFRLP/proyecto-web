import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'
import type { StatusVariant } from 'shared/components'

import { ordersCopy } from '../../content'
import type { CoverageLevel, WarehouseCoverage } from '../../utils/shipping'
import { SelectableCard } from '../SelectableCard'

import {
  OptionHeader,
  OptionTitle,
  OptionsGrid,
  ScreenReaderOnly,
} from './OriginWarehousePicker.styles'
import type { OriginWarehousePickerProps } from './OriginWarehousePicker.types'

const { origin: copy } = ordersCopy.shipping

const BADGE_STATUS: Record<CoverageLevel, StatusVariant> = {
  full: 'success',
  partial: 'warning',
  none: 'error',
}

function coverageLabel(coverage: WarehouseCoverage): string {
  if (coverage.level === 'full') return copy.coverage.full
  if (coverage.level === 'partial') return copy.coverage.partial(coverage.missing.length)
  return copy.coverage.none
}

/**
 * Los depósitos de la empresa como tarjetas elegibles (S06), cada una con su
 * nivel de stock para las líneas del borrador.
 *
 * Es un grupo de radios: una sola opción, navegable con el teclado. Un depósito
 * que no cubre la orden entera queda deshabilitado —la orden sale de un solo
 * depósito y el alta lo rechazaría—, y el motivo viaja en su descripción
 * accesible, no sólo en el color del badge. Mientras el stock carga, ninguno se
 * puede elegir todavía.
 */
export function OriginWarehousePicker({
  warehouses,
  coverage,
  selectedId,
  onSelect,
}: OriginWarehousePickerProps) {
  return (
    <OptionsGrid role="radiogroup" aria-label={copy.groupLabel}>
      {warehouses.map((warehouse) => {
        const itsCoverage = coverage?.get(warehouse.id)
        const selected = warehouse.id === selectedId
        const available = itsCoverage?.level === 'full'
        const detailId = `origin-warehouse-${warehouse.id}-detail`

        return (
          <SelectableCard
            key={warehouse.id}
            role="radio"
            aria-checked={selected}
            aria-describedby={detailId}
            selected={selected}
            disabled={!available}
            onClick={() => onSelect(warehouse)}
          >
            <OptionHeader>
              <OptionTitle>
                <Typography variant="bodyLg" component="span" sx={{ fontWeight: 600 }}>
                  {warehouse.name}
                </Typography>
                <Typography variant="dataMono" component="span" sx={{ color: 'text.secondary' }}>
                  {copy.zipCode(warehouse.zipCode)}
                </Typography>
              </OptionTitle>
              {selected ? (
                <CheckCircleIcon color="primary" aria-hidden />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: 'text.secondary' }} aria-hidden />
              )}
            </OptionHeader>

            <Typography variant="bodyMd" component="span" sx={{ color: 'text.secondary' }}>
              {warehouse.address}
            </Typography>

            <span id={detailId}>
              {itsCoverage === undefined ? (
                <StatusBadge status="neutral" label={copy.coverage.loading} size="sm" />
              ) : (
                <StatusBadge
                  status={BADGE_STATUS[itsCoverage.level]}
                  label={coverageLabel(itsCoverage)}
                  size="sm"
                />
              )}
              {itsCoverage !== undefined && itsCoverage.missing.length > 0 ? (
                <ScreenReaderOnly>{copy.missingDetail(itsCoverage.missing)}</ScreenReaderOnly>
              ) : null}
            </span>
          </SelectableCard>
        )
      })}
    </OptionsGrid>
  )
}
