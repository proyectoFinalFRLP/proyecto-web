import type { StatusVariant } from 'shared/components'

export interface ProductDetailHeaderProps {
  /** Código del producto: es el título de la pantalla y el último tramo del breadcrumb. */
  sku: string
  /** Nombre comercial, debajo del SKU. */
  name: string
  /** Texto del badge de disponibilidad (ya resuelto por quien monta el header). */
  statusLabel: string
  statusVariant: StatusVariant
  /** Ruta del catálogo, para el tramo navegable del breadcrumb. */
  catalogPath: string
  onEdit: () => void
}
