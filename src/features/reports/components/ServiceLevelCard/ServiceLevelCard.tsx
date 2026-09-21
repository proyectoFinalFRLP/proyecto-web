import CheckIcon from '@mui/icons-material/Check'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ProgressIndicator } from 'shared/components'
import type { ProgressTone } from 'shared/components'

import { reportsCopy } from '../../content'
import { formatPercent } from '../../utils/format'
import { serviceLevelTone } from '../../utils/status'

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

// El ícono que acompaña al porcentaje, por tono (los del ProgressBar del DS).
const TONE_ICONS: Record<ProgressTone, ReactNode> = {
  primary: <CheckIcon />,
  success: <CheckIcon />,
  info: <CheckIcon />,
  neutral: <CheckIcon />,
  warning: <WarningAmberOutlinedIcon />,
  error: <ErrorOutlineIcon />,
}

/**
 * «Nivel de servicio» de S14: la tasa de entregas en plazo de cada operador
 * logístico, como barra fina con su porcentaje. El tono lo decide la tasa (ver
 * `serviceLevelTone`), no el operador.
 */
export function ServiceLevelCard({ levels }: ServiceLevelCardProps) {
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

      <CarrierList as="ol">
        {levels.map(({ carrier, onTimeRate }) => {
          const tone = serviceLevelTone(onTimeRate)

          return (
            <CarrierRow as="li" key={carrier}>
              <CarrierHeader>
                <Typography variant="bodyMd">{carrier}</Typography>
                <CarrierRate tone={tone}>
                  {TONE_ICONS[tone]}
                  <RateValue>{formatPercent(onTimeRate)}</RateValue>
                </CarrierRate>
              </CarrierHeader>
              {/* Canal neutro: el tono codifica el estado de cada operador y el
                  100% de referencia es el mismo en todas las filas, así las
                  barras se comparan entre sí. El rótulo visible vive fuera de
                  la barra, por eso el nombre accesible va explícito. */}
              <ProgressIndicator
                size="thin"
                track="neutral"
                tone={tone}
                value={onTimeRate}
                ariaLabel={copy.barLabel(carrier)}
              />
            </CarrierRow>
          )
        })}
      </CarrierList>
    </ServiceCard>
  )
}
