import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckIcon from '@mui/icons-material/Check'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ProgressIndicator, StatusFeed } from 'shared/components'
import type { StatusFeedEntry } from 'shared/components'
import { lookup } from 'shared/utils'

import { ordersCopy } from '../../content'
import type { Shipment, ShipmentStatus } from '../../types'
import { formatEventTimestamp } from '../../utils/format'
import {
  buildLifecycle,
  closedWithoutDelivery,
  eventsNewestFirst,
  lifecycleProgress,
  shipmentStatusLabel,
  shipmentStatusVariant,
} from '../../utils/shipment'
import type { LifecycleStage } from '../../utils/shipment'
import { ShipmentStateMessage } from '../ShipmentStateMessage'

import {
  CardAction,
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
// Los finales sin entrega (TESIS-188) llevan el suyo siempre: no se cumplen.
const STAGE_ICONS: Record<ShipmentStatus, ReactNode> = {
  pending: <ScheduleOutlinedIcon />,
  ready_to_ship: <Inventory2OutlinedIcon />,
  in_transit: <LocalShippingOutlinedIcon />,
  delivered: <FlagOutlinedIcon />,
  returned: <AssignmentReturnOutlinedIcon />,
  cancelled: <BlockOutlinedIcon />,
}

// Un estado que la API manda y el front todavía no conoce.
const UNKNOWN_ICON = <HelpOutlineIcon />

// Etapa de la fila. Stateless y usada sólo acá: no justifica archivo propio.
function StageCell({ stage }: { stage: LifecycleStage }) {
  let when: string = lifecycleCopy.notReached
  if (stage.reachedAt !== null) when = formatEventTimestamp(stage.reachedAt)
  else if (stage.state !== 'pending') when = lifecycleCopy.noDate

  // Donde quedó el envío es el paso vigente, siga o no.
  const here = stage.state === 'current' || stage.state === 'closed'

  return (
    <StageItem as="li" aria-current={here ? 'step' : undefined}>
      <StageDot
        stageState={stage.state}
        stageTone={shipmentStatusVariant(stage.status)}
        aria-hidden
      >
        {stage.state === 'done' ? <CheckIcon /> : lookup(STAGE_ICONS, stage.status, UNKNOWN_ICON)}
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
 * Un envío devuelto o cancelado (TESIS-188) muestra las etapas que recorrió y
 * cierra con su final, sin la entrega que ya no va a pasar.
 */
export function ShipmentLifecycleCard({
  shipment,
  action,
  pickup = false,
}: ShipmentLifecycleCardProps) {
  return (
    <LifecycleCard>
      <CardHeading>
        <RouteOutlinedIcon aria-hidden />
        <Typography variant="h3" component="h2" color="text.primary">
          {lifecycleCopy.title}
        </Typography>
        {action === undefined ? null : <CardAction>{action}</CardAction>}
      </CardHeading>

      {shipment.kind === 'single' ? (
        <>
          {/* Devuelto o cancelado llena la barra (el ciclo terminó) con el tono
              de su estado, para que no se lea como una entrega. */}
          <ProgressIndicator
            value={lifecycleProgress(shipment.shipment.status)}
            tone={
              closedWithoutDelivery(shipment.shipment.status)
                ? shipmentStatusVariant(shipment.shipment.status)
                : undefined
            }
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
        <ShipmentStateMessage view={shipment} pickup={pickup} />
      )}
    </LifecycleCard>
  )
}
