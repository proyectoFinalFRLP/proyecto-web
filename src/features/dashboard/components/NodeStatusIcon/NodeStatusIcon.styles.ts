import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { StatusVariant } from 'shared/components'

import type { NodeSyncStatus } from '../../types'

// Tono por estado. `S03-Panel` pinta el nodo sano con `--ok` y el caído con
// `--err`; el diseño no contempla un tercer estado porque asume que todo nodo
// reporta, así que `unknown` va en neutro — apagado, no alarmado.
export const STATUS_TONE: Record<NodeSyncStatus, StatusVariant> = {
  online: 'success',
  stale: 'error',
  unknown: 'neutral',
}

// 16px es el tamaño del ícono de estado en el diseño.
const ICON_SIZE = 16

interface StatusRootProps {
  tone: StatusVariant
}

const TRANSIENT_PROPS = new Set<string>(['tone'])

export const StatusRoot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<StatusRootProps>(({ theme, tone }) => ({
  display: 'inline-flex',
  flexShrink: 0,
  color: theme.palette[tone].main,
  '& svg': { display: 'block', fontSize: ICON_SIZE },
}))
