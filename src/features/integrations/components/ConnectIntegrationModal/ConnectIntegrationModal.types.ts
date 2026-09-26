import type { ApiRequestError, IntegrationService } from 'shared/api'

import type { ConnectionPayload } from '../../api'

export interface ConnectIntegrationModalProps {
  /** El proveedor a conectar o configurar; `null` cierra el modal. */
  service: IntegrationService | null
  submitting?: boolean
  /** El rechazo del último guardado: sus `fields` se muestran en cada input. */
  submitError?: ApiRequestError | null
  onSubmit: (payload: ConnectionPayload) => void
  onClose: () => void
}
