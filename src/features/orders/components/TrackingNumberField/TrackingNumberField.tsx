import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { IconButton, Tooltip, Typography } from '@mui/material'
import { notify } from 'shared/store'

import { ordersCopy } from '../../content'

import { Field, TrackingRow, TrackingValue } from './TrackingNumberField.styles'

const trackingCopy = ordersCopy.detail.shipping.tracking

interface TrackingNumberFieldProps {
  /** Null mientras el courier no confirmó el despacho. */
  trackingNumber: string | null
}

/**
 * Número de seguimiento del envío, con copia rápida.
 *
 * Sin número no se muestra un campo vacío sino «Pendiente de despacho»: el
 * número lo asigna el courier al confirmar el despacho (TESIS-47), y un hueco
 * se leería como un dato perdido.
 */
export function TrackingNumberField({ trackingNumber }: TrackingNumberFieldProps) {
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      notify(trackingCopy.copied, 'success')
    } catch {
      // Sin permiso de portapapeles (o fuera de un contexto seguro) el número
      // sigue a la vista: se avisa y el operador lo selecciona a mano.
      notify(trackingCopy.copyFailed, 'error')
    }
  }

  return (
    <Field>
      <Typography variant="labelSm" color="text.secondary">
        {trackingCopy.label}
      </Typography>
      {trackingNumber === null ? (
        <Typography variant="bodyMd" color="text.disabled">
          {trackingCopy.pending}
        </Typography>
      ) : (
        <TrackingRow>
          <TrackingValue variant="dataMono">{trackingNumber}</TrackingValue>
          <Tooltip title={trackingCopy.copy}>
            <IconButton
              size="small"
              aria-label={trackingCopy.copy}
              onClick={() => void copy(trackingNumber)}
            >
              <ContentCopyOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TrackingRow>
      )}
    </Field>
  )
}
