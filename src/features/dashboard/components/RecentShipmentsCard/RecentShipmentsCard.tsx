import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { Skeleton, Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'

import { dashboardCopy } from '../../content'

import {
  CourierName,
  RowLink,
  HeaderRow,
  ListCard,
  ShipmentIdentity,
  ShipmentRow,
  ShipmentRows,
  ShipmentTile,
  SKELETON_ROWS,
  SKELETON_TILE,
  TrackingLine,
} from './RecentShipmentsCard.styles'
import type { RecentShipmentsCardProps } from './RecentShipmentsCard.types'

const shipmentsCopy = dashboardCopy.shipments

// El tono del estado, con el mismo vocabulario que el resto del producto. Mapa
// explícito y no un `switch` con default: si el backend suma un estado, el
// compilador marca este archivo en vez de pintarlo en gris sin avisar.
const TONES = {
  pending: 'neutral',
  ready_to_ship: 'info',
  in_transit: 'info',
  delivered: 'success',
} as const

/**
 * «Últimos envíos» del panel (TESIS-163).
 *
 * Reemplaza a la tarjeta de Integraciones, que mostraba la salud de los nodos:
 * las conexiones las administra el equipo y no la empresa, y lo que al operador
 * le sirve de esa columna es qué salió, con quién y en qué anda.
 *
 * Sale de `GET /shipments`, que existe paginado desde TESIS-113 y hasta ahora
 * sólo alimentaba el KPI de envíos activos.
 */
export function RecentShipmentsCard({ shipments, loading = false }: RecentShipmentsCardProps) {
  const rows = loading
    ? SKELETON_ROWS.map((id) => (
        <ShipmentRow key={id}>
          <Skeleton variant="rounded" width={SKELETON_TILE} height={SKELETON_TILE} />
          <Skeleton variant="text" sx={{ flexGrow: 1 }} />
        </ShipmentRow>
      ))
    : shipments.map((shipment) => (
        // La fila entera lleva a la orden: el detalle del envío vive ahí, no en
        // una pantalla propia.
        <RowLink
          key={shipment.id}
          to={shipmentsCopy.orderPath(shipment.orderId)}
          aria-label={shipmentsCopy.openOrder(shipment.orderId)}
        >
          <ShipmentRow>
            <ShipmentTile aria-hidden>
              <LocalShippingOutlinedIcon />
            </ShipmentTile>
            <ShipmentIdentity>
              {/* El operador se asigna al confirmar el despacho (TESIS-47): hasta
                entonces se dice que no hay, en vez de dejar la línea vacía. */}
              <CourierName variant="bodyMd">
                {shipment.courier ?? shipmentsCopy.noCourier}
              </CourierName>
              <TrackingLine variant="labelSm">
                {shipment.trackingNumber ?? shipmentsCopy.noTracking}
              </TrackingLine>
            </ShipmentIdentity>
            <StatusBadge
              status={TONES[shipment.status]}
              label={shipmentsCopy.status[shipment.status]}
              size="sm"
            />
          </ShipmentRow>
        </RowLink>
      ))

  return (
    <ListCard aria-busy={loading}>
      <HeaderRow>
        <Typography variant="h3">{shipmentsCopy.title}</Typography>
        <LocalShippingOutlinedIcon />
      </HeaderRow>

      <Typography variant="labelSm" color="text.secondary">
        {loading ? '' : shipmentsCopy.subtitle(shipments.length)}
      </Typography>

      {!loading && shipments.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {shipmentsCopy.empty}
        </Typography>
      ) : (
        <ShipmentRows>{rows}</ShipmentRows>
      )}
    </ListCard>
  )
}
