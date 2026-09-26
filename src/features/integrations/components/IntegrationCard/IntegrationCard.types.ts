import type { IntegrationService } from 'shared/api'

export interface IntegrationCardProps {
  service: IntegrationService
  /** Hay una acción en vuelo sobre este proveedor: sus botones se bloquean. */
  busy?: boolean
  testing?: boolean
  onConnect: (service: IntegrationService) => void
  onTest: (service: IntegrationService) => void
  onToggle: (service: IntegrationService) => void
  onDisconnect: (service: IntegrationService) => void
}
