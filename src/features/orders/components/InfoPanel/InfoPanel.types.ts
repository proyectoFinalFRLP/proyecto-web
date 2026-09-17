import type { ReactNode } from 'react'

export interface InfoField {
  id: string
  label: string
  value: string
  /** Familia monoespaciada, para teléfonos, documentos y códigos. */
  mono?: boolean
  /** Atenúa el valor cuando es la marca de "sin dato" y no un dato. */
  unknown?: boolean
}

export interface InfoPanelProps {
  /** Rótulo del panel, en versalitas ("Datos del cliente"). */
  title: string
  icon: ReactNode
  fields: InfoField[]
  /** Contenido antes de los campos, para los que no son un par rótulo-valor. */
  children?: ReactNode
  /** Aclaración al pie: qué datos del diseño no registra el modelo. */
  footnote?: string
}
