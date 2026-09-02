import { Box, Skeleton, Typography } from '@mui/material'
import { formatRelativeTime } from 'shared/utils'

import { dashboardCopy } from '../../content'
import type { InfraNode } from '../../hooks/useInfraHealth'
import { NodeStatusLed } from '../NodeStatusLed'

import {
  HeaderBlock,
  LED_SKELETON_SIZE,
  ListCard,
  NodeIdentity,
  NodeName,
  NodeRow,
  SKELETON_ROWS,
} from './IntegrationNodeList.styles'
import type { IntegrationNodeListProps } from './IntegrationNodeList.types'

const nodesCopy = dashboardCopy.infra.nodes

// Tiempo relativo de la última sync ("Sync: hace 2 minutos"). Sin marca de sync
// no inventamos un tiempo: se dice explícitamente que el dato no está.
function syncLabel(node: InfraNode): string {
  if (!node.lastSyncedAt) return nodesCopy.status.unknown

  return `${nodesCopy.syncPrefix} ${formatRelativeTime(node.lastSyncedAt)}`
}

// Lista de nodos activos: un LED de estado, la identidad del servicio y el
// tiempo transcurrido desde su última sincronización exitosa.
export function IntegrationNodeList({ nodes, loading = false }: IntegrationNodeListProps) {
  const rows = loading
    ? SKELETON_ROWS.map((id) => (
        <NodeRow key={id}>
          <Skeleton variant="circular" width={LED_SKELETON_SIZE} height={LED_SKELETON_SIZE} />
          <Skeleton variant="text" sx={{ flexGrow: 1 }} />
        </NodeRow>
      ))
    : nodes.map((node) => (
        <NodeRow key={node.serviceId}>
          <NodeStatusLed status={node.status} label={nodesCopy.status[node.status]} />
          <NodeIdentity>
            <NodeName>
              <Typography variant="bodyMd">{node.name}</Typography>
            </NodeName>
            <Typography variant="labelSm" color="text.secondary">
              {nodesCopy.types[node.type]}
            </Typography>
          </NodeIdentity>
          <Typography variant="dataMono" color="text.secondary" noWrap>
            {syncLabel(node)}
          </Typography>
        </NodeRow>
      ))

  return (
    <ListCard aria-busy={loading}>
      <HeaderBlock>
        <Typography variant="h3">{nodesCopy.title}</Typography>
        <Typography variant="labelSm" color="text.secondary">
          {nodesCopy.subtitle(nodes.length)}
        </Typography>
      </HeaderBlock>

      {!loading && nodes.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {nodesCopy.empty}
        </Typography>
      ) : (
        <Box>{rows}</Box>
      )}
    </ListCard>
  )
}
