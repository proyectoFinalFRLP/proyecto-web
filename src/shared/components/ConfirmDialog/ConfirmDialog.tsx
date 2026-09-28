import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Button, Typography } from '@mui/material'
import { useId } from 'react'

import { ModalBody, ModalFooter, ModalFooterActions, ModalFrame } from '../ModalFrame'

import { DangerIcon } from './ConfirmDialog.styles'
import type { ConfirmDialogProps } from './ConfirmDialog.types'

/**
 * Confirmación de una acción antes de ejecutarla, sobre el `ModalFrame`.
 *
 * Es presentacional: no ejecuta nada. Quien lo monta hace la llamada en
 * `onConfirm`, marca `busy` mientras está en vuelo y decide si cerrarlo o
 * dejarlo abierto con el error en `children`.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  closeLabel,
  tone = 'default',
  size = 'sm',
  busy = false,
  canConfirm = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const descriptionId = useId()
  const destructive = tone === 'destructive'

  return (
    <ModalFrame
      open={open}
      title={title}
      icon={
        destructive ? (
          <DangerIcon aria-hidden>
            <WarningAmberRoundedIcon />
          </DangerIcon>
        ) : undefined
      }
      closeLabel={closeLabel}
      onClose={onClose}
      size={size}
      busy={busy}
      role="alertdialog"
      describedBy={description === undefined ? undefined : descriptionId}
    >
      {/* Una pregunta no se reparte en secciones: el cuerpo va más apretado que
          el de un formulario. */}
      <ModalBody sx={{ gap: 2 }}>
        {description === undefined ? null : (
          <Typography id={descriptionId} variant="bodyMd" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
        {children}
      </ModalBody>

      <ModalFooter>
        <ModalFooterActions>
          {/* En una destructiva el foco arranca en cancelar: un Enter apurado no
              tiene que poder borrar nada. */}
          <Button color="neutral" onClick={onClose} disabled={busy} autoFocus={destructive}>
            {cancelLabel}
          </Button>
          {canConfirm ? (
            <Button
              variant="contained"
              color={destructive ? 'error' : 'primary'}
              onClick={onConfirm}
              disabled={busy}
            >
              {confirmLabel}
            </Button>
          ) : null}
        </ModalFooterActions>
      </ModalFooter>
    </ModalFrame>
  )
}
