import type { ReactNode } from 'react'

export interface FormSectionProps {
  /** Ícono de Material que acompaña al título. */
  icon: ReactNode
  title: string
  children: ReactNode
}
