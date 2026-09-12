import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import type { ReactNode } from 'react'

import type { NodeSyncStatus } from '../../types'

import { STATUS_TONE, StatusRoot } from './NodeStatusIcon.styles'
import type { NodeStatusIconProps } from './NodeStatusIcon.types'

// Los dos primeros son los del diseño (`check_circle` / `error`). El tercero
// cubre el nodo que no reporta: un círculo tachado lee como "sin señal" y no
// como "falla".
const STATUS_ICON: Record<NodeSyncStatus, ReactNode> = {
  online: <CheckCircleIcon />,
  stale: <ErrorIcon />,
  unknown: <RemoveCircleOutlineIcon />,
}

// Indicador de estado del nodo, en la columna derecha de la fila.
export function NodeStatusIcon({ status, label }: NodeStatusIconProps) {
  return (
    <StatusRoot role="img" aria-label={label} title={label} tone={STATUS_TONE[status]}>
      {STATUS_ICON[status]}
    </StatusRoot>
  )
}
