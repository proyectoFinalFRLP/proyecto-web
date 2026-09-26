import { Button, Typography } from '@mui/material'
import type { IntegrationService } from 'shared/api'
import { StatusBadge } from 'shared/components'
import type { StatusVariant } from 'shared/components'

import { integrationsCopy } from '../../content'

import { Actions, CardHeader, CardRoot, SettingsList } from './IntegrationCard.styles'
import type { IntegrationCardProps } from './IntegrationCard.types'

const { status: statusCopy, actions } = integrationsCopy

function resolveStatus(service: IntegrationService): { label: string; variant: StatusVariant } {
  if (!service.configured) return { label: statusCopy.notConnected, variant: 'neutral' }
  if (!service.isActive) return { label: statusCopy.inactive, variant: 'warning' }
  return { label: statusCopy.connected, variant: 'success' }
}

/**
 * Un proveedor en la pantalla de integraciones: su estado para la empresa, la
 * configuración de la cuenta (nunca los secretos) y lo que se puede hacer con él.
 */
export function IntegrationCard({
  service,
  busy = false,
  testing = false,
  onConnect,
  onTest,
  onToggle,
  onDisconnect,
}: IntegrationCardProps) {
  const status = resolveStatus(service)
  const settings = service.settingFields.filter((field) => service.settings[field.key])

  return (
    <CardRoot>
      <CardHeader>
        <Typography variant="h3" component="h3">
          {service.name}
        </Typography>
        <StatusBadge status={status.variant} label={status.label} size="sm" />
      </CardHeader>

      {settings.length > 0 ? (
        <SettingsList>
          {settings.map((field) => (
            <Typography key={field.key} variant="bodyMd" color="text.secondary">
              {`${field.label}: ${service.settings[field.key]}`}
            </Typography>
          ))}
        </SettingsList>
      ) : null}

      <Actions>
        <Button
          variant={service.configured ? 'outlined' : 'contained'}
          size="small"
          onClick={() => onConnect(service)}
          disabled={busy}
        >
          {service.configured ? actions.configure : actions.connect}
        </Button>

        {service.configured && service.testable ? (
          <Button variant="outlined" size="small" onClick={() => onTest(service)} disabled={busy}>
            {testing ? actions.testing : actions.test}
          </Button>
        ) : null}

        {service.configured ? (
          <Button
            color="neutral"
            variant="text"
            size="small"
            onClick={() => onToggle(service)}
            disabled={busy}
          >
            {service.isActive ? actions.deactivate : actions.activate}
          </Button>
        ) : null}

        {service.configured ? (
          <Button
            color="error"
            variant="text"
            size="small"
            onClick={() => onDisconnect(service)}
            disabled={busy}
          >
            {actions.disconnect}
          </Button>
        ) : null}
      </Actions>
    </CardRoot>
  )
}
