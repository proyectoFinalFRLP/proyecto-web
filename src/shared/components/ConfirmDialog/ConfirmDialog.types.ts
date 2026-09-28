import type { ReactNode } from 'react'

import type { ModalSize } from '../ModalFrame'

/**
 * `destructive` es para lo que no se puede deshacer (una baja, una cancelación):
 * suma el ícono de advertencia y pinta la confirmación en rojo.
 */
export type ConfirmDialogTone = 'default' | 'destructive'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  /** Qué va a pasar, con el dato que identifica al objeto (un ID, un SKU). */
  description?: ReactNode
  /** Contenido extra bajo la descripción: típicamente un `Alert` con un error. */
  children?: ReactNode
  confirmLabel: string
  cancelLabel: string
  /** Nombre accesible de la X de la cabecera. */
  closeLabel: string
  tone?: ConfirmDialogTone
  /** `sm` por defecto: el tamaño de una pregunta, no de un formulario. */
  size?: ModalSize
  /** La acción está en vuelo: nada se puede tocar ni cerrar hasta que vuelva. */
  busy?: boolean
  /**
   * En `false` la confirmación desaparece y queda sólo cancelar. Es para cuando
   * la acción ya fue rechazada y reintentarla va a fallar igual.
   */
  canConfirm?: boolean
  onConfirm: () => void
  onClose: () => void
}
