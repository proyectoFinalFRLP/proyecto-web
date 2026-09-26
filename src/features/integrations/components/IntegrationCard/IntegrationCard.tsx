import { Typography } from '@mui/material'
import type { IntegrationService } from 'shared/api'
import { StatusBadge } from 'shared/components'
import type { StatusVariant } from 'shared/components'

import { integrationsCopy } from '../../content'

import { CardHeader, CardRoot } from './IntegrationCard.styles'
import type { IntegrationCardProps } from './IntegrationCard.types'

const { status: statusCopy, account } = integrationsCopy

function resolveStatus(service: IntegrationService): { label: string; variant: StatusVariant } {
  if (!service.configured) return { label: statusCopy.notConnected, variant: 'neutral' }
  if (!service.isActive) return { label: statusCopy.inactive, variant: 'warning' }
  return { label: statusCopy.connected, variant: 'success' }
}

/**
 * Un proveedor en la pantalla de integraciones: su estado para la empresa y la
 * cuenta a la que está conectada. Sólo lectura: las conexiones las carga el
 * equipo de OneStock desde el backoffice.
 */
export function IntegrationCard({ service }: IntegrationCardProps) {
  const status = resolveStatus(service)
  const accountName = service.configured ? service.accountName : null

  return (
    <CardRoot>
      <CardHeader>
        <Typography variant="h3" component="h3">
          {service.name}
        </Typography>
        <StatusBadge status={status.variant} label={status.label} size="sm" />
      </CardHeader>

      {accountName ? (
        <Typography variant="bodyMd" color="text.secondary">
          {account(accountName)}
        </Typography>
      ) : null}
    </CardRoot>
  )
}
