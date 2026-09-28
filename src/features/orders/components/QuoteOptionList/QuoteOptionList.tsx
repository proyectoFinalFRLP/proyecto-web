import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { Stack, Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'

import { ordersCopy } from '../../content'
import { formatMoney } from '../../utils/format'
import { SelectableCard } from '../SelectableCard'

import {
  CarrierMark,
  CarrierText,
  OptionRow,
  OptionsColumn,
  Price,
  PriceColumn,
} from './QuoteOptionList.styles'
import type { QuoteOptionListProps } from './QuoteOptionList.types'

const { options: copy } = ordersCopy.carrier

/**
 * Las opciones de envío cotizadas (S07), una por fila, para elegir con qué
 * operador sale la orden.
 *
 * Es un grupo de radios: una sola opción, navegable con el teclado. La primera
 * lleva «Más económico» porque la cotización llega ordenada por precio. S07
 * dibuja además «Alta confiabilidad» y «Seguimiento incluido», pero la API no
 * informa ninguno de los dos datos, y un badge que no sale de un dato es una
 * promesa que la pantalla no puede sostener.
 */
export function QuoteOptionList({
  quotes,
  selectedId,
  onSelect,
  disabled = false,
}: QuoteOptionListProps) {
  return (
    <OptionsColumn role="radiogroup" aria-label={copy.groupLabel}>
      {quotes.map((quote, index) => {
        const selected = quote.dispatchIntegrationId === selectedId

        return (
          <SelectableCard
            key={quote.dispatchIntegrationId}
            role="radio"
            aria-checked={selected}
            selected={selected}
            disabled={disabled}
            onClick={() => onSelect(quote)}
          >
            <OptionRow>
              <CarrierMark aria-hidden>
                <Typography variant="labelCaps">{quote.providerName}</Typography>
              </CarrierMark>

              <CarrierText>
                <Stack
                  direction="row"
                  useFlexGap
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="bodyLg" component="span" sx={{ fontWeight: 600 }}>
                    {quote.providerName}
                  </Typography>
                  {index === 0 ? (
                    <StatusBadge status="info" label={copy.cheapest} size="sm" />
                  ) : null}
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center', color: 'text.secondary' }}
                >
                  <ScheduleIcon sx={{ fontSize: 16 }} aria-hidden />
                  <Typography variant="bodyMd" component="span" sx={{ whiteSpace: 'nowrap' }}>
                    {quote.estimatedDays === null ? copy.noEta : copy.eta(quote.estimatedDays)}
                  </Typography>
                </Stack>
              </CarrierText>

              <PriceColumn>
                <Price>{formatMoney(quote.shippingCost)}</Price>
                <Typography variant="labelSm" component="span" sx={{ color: 'text.secondary' }}>
                  {copy.priceCaption}
                </Typography>
              </PriceColumn>

              {selected ? (
                <CheckCircleIcon color="primary" aria-hidden />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: 'text.secondary' }} aria-hidden />
              )}
            </OptionRow>
          </SelectableCard>
        )
      })}
    </OptionsColumn>
  )
}
