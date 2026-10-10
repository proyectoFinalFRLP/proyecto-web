import type { ReactNode } from 'react'

export interface FormSectionProps {
  /** Ícono de Material que acompaña al título. */
  icon: ReactNode
  title: string
  /** Hay que completarla para avanzar: el título lleva la marca de obligatorio. */
  required?: boolean
  children: ReactNode
}
