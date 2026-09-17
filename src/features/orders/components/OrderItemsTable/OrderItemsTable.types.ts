import type { OrderLine } from '../../types'

export interface OrderItemsTableProps {
  lines: OrderLine[]
  /**
   * Ruta al detalle de un producto. La arma quien monta la tabla: las rutas se
   * registran en `app/router`, que una feature no puede importar.
   */
  productPath: (productId: number) => string
}
