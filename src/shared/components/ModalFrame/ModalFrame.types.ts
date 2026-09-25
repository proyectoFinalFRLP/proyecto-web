import type { ReactNode } from 'react'

/** Ancho máximo del modal: sm 480 · md 672 (el ModalFrame del diseño) · lg 880. */
export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalFrameProps {
  open: boolean
  title: string
  subtitle?: ReactNode
  /** Glifo a la izquierda del título, ya con su recuadro (p. ej. la advertencia de una baja). */
  icon?: ReactNode
  /** Nombre accesible de la X de la cabecera. */
  closeLabel: string
  onClose: () => void
  /** `md` por defecto: el ancho del ModalFrame del diseño. */
  size?: ModalSize
  /**
   * Hay una acción en vuelo: el modal no se cierra ni con la X, ni con Esc, ni
   * con un clic afuera, así el resultado llega a algo que sigue a la vista.
   */
  busy?: boolean
  /** `alertdialog` para lo que interrumpe pidiendo una decisión (una confirmación). */
  role?: 'dialog' | 'alertdialog'
  /** Id del nodo que describe el modal, para que el lector de pantalla lo lea al abrir. */
  describedBy?: string
  /** Cuerpo y pie: `ModalBody` + `ModalFooter`, o un `ModalForm` que los envuelva. */
  children: ReactNode
}
