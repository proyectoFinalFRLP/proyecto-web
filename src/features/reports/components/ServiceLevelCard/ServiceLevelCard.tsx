import { Typography } from '@mui/material'
import { ProgressIndicator } from 'shared/components'

import { reportsCopy } from '../../content'
import { formatPercent } from '../../utils/format'

import {
  CardHeading,
  CarrierHeader,
  CarrierList,
  CarrierRate,
  CarrierRow,
  RateValue,
  ServiceCard,
} from './ServiceLevelCard.styles'
import type { ServiceLevelCardProps } from './ServiceLevelCard.types'

const { serviceLevel: copy } = reportsCopy

/** Entregados sobre despachados, 0-100. Sin despachos no hay tasa. */
function deliveredRate({ dispatched, delivered }: { dispatched: number; delivered: number }) {
  return dispatched === 0 ? 0 : (delivered / dispatched) * 100
}

/**
 * La columna lateral de S14, con lo que el modelo puede afirmar: cuántos de
 * los envíos que despachó cada operador en el período ya llegaron.
 *
 * El diseño muestra acá las entregas **en plazo**, que necesitan una fecha
 * comprometida que los envíos no guardan. Un envío despachado ayer que todavía
 * viaja no es un incumplimiento, así que la barra va en un solo tono: el color
 * semántico del diseño diría «mal servicio» de algo que sólo está en camino.
 */
export function ServiceLevelCard({ carriers }: ServiceLevelCardProps) {
  return (
    <ServiceCard>
      <CardHeading>
        <Typography variant="h3" component="h2">
          {copy.title}
        </Typography>
        <Typography variant="labelSm" color="text.secondary">
          {copy.subtitle}
        </Typography>
      </CardHeading>

      {carriers.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {copy.empty}
        </Typography>
      ) : (
        <CarrierList as="ol">
          {carriers.map((row) => (
            <CarrierRow as="li" key={row.carrier}>
              <CarrierHeader>
                <Typography variant="bodyMd">{row.carrier}</Typography>
                <CarrierRate tone="primary">
                  <RateValue>{copy.delivered(row.delivered, row.dispatched)}</RateValue>
                  <Typography variant="labelSm" color="text.secondary" component="span">
                    {formatPercent(deliveredRate(row))}
                  </Typography>
                </CarrierRate>
              </CarrierHeader>
              <ProgressIndicator
                size="thin"
                track="neutral"
                tone="primary"
                value={deliveredRate(row)}
                ariaLabel={copy.barLabel(row.carrier)}
              />
            </CarrierRow>
          ))}
        </CarrierList>
      )}
    </ServiceCard>
  )
}
