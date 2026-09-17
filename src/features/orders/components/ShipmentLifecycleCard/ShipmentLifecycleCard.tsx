import CheckIcon from '@mui/icons-material/Check'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ProgressIndicator, StatusFeed } from 'shared/components'
import type { StatusFeedEntry } from 'shared/components'

import { ordersCopy } from '../../content'
import type { Shipment, ShipmentStatus } from '../../types'
import { formatEventTimestamp } from '../../utils/format'
import {
  buildLifecycle,
  eventsNewestFirst,
  lifecycleProgress,
  shipmentStatusLabel,
} from '../../utils/shipment'
import type { LifecycleStage } from '../../utils/shipment'
import { ShipmentStateMessage } from '../ShipmentStateMessage'

import {
  CardHeading,
  LifecycleCard,
  StageDot,
  StageGrid,
  StageItem,
  StageLabel,
  StageWhen,
} from './ShipmentLifecycleCard.styles'
import type { ShipmentLifecycleCardProps } from './ShipmentLifecycleCard.types'

const lifecycleCopy = ordersCopy.detail.lifecycle

// El ícono de la etapa mientras no está completa. Completa, lleva el check.
const STAGE_ICONS: Record<ShipmentStatus, ReactNode> = {
  pending: <ScheduleOutlinedIcon />,
  ready_to_ship: <Inventory2OutlinedIcon />,
  in_transit: <LocalShippingOutlinedIcon />,
  delivered: <FlagOutlinedIcon />,
}

// Etapa de la fila. Stateless y usada sólo acá: no justifica archivo propio.
function StageCell({ stage }: { stage: LifecycleStage }) {
  let when: string = lifecycleCopy.notReached
  if (stage.reachedAt !== null) when = formatEventTimestamp(stage.reachedAt)
  else if (stage.state !== 'pending') when = lifecycleCopy.noDate

  return (
    <StageItem as="li" aria-current={stage.state === 'current' ? 'step' : undefined}>
      <StageDot stageState={stage.state} aria-hidden>
        {stage.state === 'done' ? <CheckIcon /> : STAGE_ICONS[stage.status]}
      </StageDot>
      <StageLabel stageState={stage.state}>{shipmentStatusLabel(stage.status)}</StageLabel>
      <StageWhen>{when}</StageWhen>
    </StageItem>
  )
}

/**
 * La bitácora del courier para el feed: el texto crudo que mandó el courier
 * como título y el estado normalizado con la hora como contexto. La entrada
 * vigente es la más reciente.
 */
function feedEntries(shipment: Shipment): StatusFeedEntry[] {
  return eventsNewestFirst(shipment).map((event, index) => ({
    id: event.id,
    title: event.externalStatus,
    meta: lifecycleCopy.eventMeta(
      shipmentStatusLabel(event.internalStatus),
      formatEventTimestamp(event.occurredAt),
    ),
    current: index === 0,
  }))
}

/**
 * «Ciclo de vida del envío» de S08: las cuatro etapas con su avance, y debajo
 * la bitácora completa de `ShipmentEvents` con los dos estados de cada evento.
 */
export function ShipmentLifecycleCard({ shipment }: ShipmentLifecycleCardProps) {
  return (
    <LifecycleCard>
      <CardHeading>
        <RouteOutlinedIcon aria-hidden />
        <Typography variant="h3" component="h2" color="text.primary">
          {lifecycleCopy.title}
        </Typography>
      </CardHeading>

      {shipment.kind === 'single' ? (
        <>
          <ProgressIndicator
            value={lifecycleProgress(shipment.shipment.status)}
            size="thin"
            ariaLabel={lifecycleCopy.progressLabel}
          />
          <StageGrid as="ol" aria-label={lifecycleCopy.stagesLabel}>
            {buildLifecycle(shipment.shipment).map((stage) => (
              <StageCell key={stage.status} stage={stage} />
            ))}
          </StageGrid>
          <StatusFeed
            label={lifecycleCopy.logLabel}
            entries={feedEntries(shipment.shipment)}
            emptyMessage={lifecycleCopy.emptyLog}
          />
        </>
      ) : (
        <ShipmentStateMessage view={shipment} />
      )}
    </LifecycleCard>
  )
}
