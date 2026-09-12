import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { Skeleton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { formatRelativeTime } from 'shared/utils'

import { dashboardCopy } from '../../content'
import type { InfraNode } from '../../hooks/useInfraHealth'
import type { ServiceType } from '../../types'
import { NodeStatusIcon } from '../NodeStatusIcon'

import {
  HeaderRow,
  ListCard,
  NodeIdentity,
  NodeName,
  NodeRow,
  NodeRows,
  SKELETON_ROWS,
  SKELETON_TILE,
  ServiceTile,
  SyncLine,
} from './IntegrationNodeList.styles'
import type { IntegrationNodeListProps } from './IntegrationNodeList.types'

const nodesCopy = dashboardCopy.infra.nodes

// El diseño distingue los nodos por el ícono del tile. Acá el criterio es el
// tipo de servicio, que es el único eje que expone la API.
const SERVICE_ICON: Record<ServiceType, ReactNode> = {
  ecommerce: <StorefrontOutlinedIcon />,
  courier: <LocalShippingOutlinedIcon />,
}

// Frase de estado de la fila. Sin marca de sync no se inventa un tiempo: se
// dice que el dato no está.
function syncLabel(node: InfraNode): string {
  if (!node.lastSyncedAt) return nodesCopy.sync.unknown

  const elapsed = formatRelativeTime(node.lastSyncedAt)
  if (elapsed === null) return nodesCopy.sync.unknown

  return node.status === 'stale' ? nodesCopy.sync.stale(elapsed) : nodesCopy.sync.online(elapsed)
}

// Widget "Integraciones" de `S03-Panel`: por cada nodo activo, su identidad, el
// tiempo desde la última sincronización exitosa y el estado resultante.
export function IntegrationNodeList({
  nodes,
  reportingNodes,
  onlineNodes,
  loading = false,
}: IntegrationNodeListProps) {
  // Mientras ningún nodo reporte sync, el contador "x/y sincronizados" no
  // significa nada: se muestra cuántas integraciones activas hay y se aclara
  // que la marca de sync no está llegando.
  const subtitle =
    reportingNodes === 0
      ? nodesCopy.subtitleNoReports(nodes.length)
      : nodesCopy.subtitleSynced(onlineNodes, reportingNodes)

  const rows = loading
    ? SKELETON_ROWS.map((id) => (
        <NodeRow key={id}>
          <Skeleton variant="rounded" width={SKELETON_TILE} height={SKELETON_TILE} />
          <Skeleton variant="text" sx={{ flexGrow: 1 }} />
        </NodeRow>
      ))
    : nodes.map((node) => (
        <NodeRow key={node.serviceId}>
          <ServiceTile role="img" aria-label={nodesCopy.types[node.type]}>
            {SERVICE_ICON[node.type]}
          </ServiceTile>
          <NodeIdentity>
            <NodeName variant="bodyMd">{node.name}</NodeName>
            <SyncLine variant="labelSm" degraded={node.status === 'stale'}>
              {syncLabel(node)}
            </SyncLine>
          </NodeIdentity>
          <NodeStatusIcon status={node.status} label={nodesCopy.status[node.status]} />
        </NodeRow>
      ))

  return (
    <ListCard aria-busy={loading}>
      <HeaderRow>
        <Typography variant="h3">{nodesCopy.title}</Typography>
        <HubOutlinedIcon />
      </HeaderRow>

      <Typography variant="labelSm" color="text.secondary">
        {loading ? '' : subtitle}
      </Typography>

      {!loading && nodes.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {nodesCopy.empty}
        </Typography>
      ) : (
        <NodeRows>{rows}</NodeRows>
      )}
    </ListCard>
  )
}
