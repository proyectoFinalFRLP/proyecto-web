import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Typography } from '@mui/material'
import { useId } from 'react'

import { ModalHeader, ModalHeading, ModalRoot } from './ModalFrame.styles'
import type { ModalFrameProps } from './ModalFrame.types'

/**
 * Marco de todos los modales de la app, el ModalFrame del diseño: cabecera con
 * título y cierre, y abajo lo que traiga cada modal —`ModalBody` y
 * `ModalFooter`, o un `ModalForm` que los envuelva—.
 *
 * El marco resuelve lo que ningún modal debería repetir: el ancho, que sólo
 * scrollee el cuerpo, el título atado al `aria-labelledby` y no dejar cerrar
 * mientras hay algo en vuelo.
 */
export function ModalFrame({
  open,
  title,
  subtitle,
  icon,
  closeLabel,
  onClose,
  size = 'md',
  busy = false,
  role = 'dialog',
  describedBy,
  children,
}: ModalFrameProps) {
  const titleId = useId()

  return (
    <ModalRoot
      open={open}
      modalSize={size}
      onClose={busy ? undefined : onClose}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      slotProps={{ paper: { role } }}
    >
      <ModalHeader>
        <ModalHeading>
          {icon}
          <div>
            <Typography id={titleId} variant="h2" component="h2">
              {title}
            </Typography>
            {subtitle === undefined ? null : (
              <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </div>
        </ModalHeading>
        <IconButton aria-label={closeLabel} onClick={onClose} size="small" disabled={busy}>
          <CloseIcon />
        </IconButton>
      </ModalHeader>

      {children}
    </ModalRoot>
  )
}
