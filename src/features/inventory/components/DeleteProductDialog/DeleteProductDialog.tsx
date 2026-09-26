import { Alert } from '@mui/material'
import { useState } from 'react'
import { ConfirmDialog } from 'shared/components'

import { inventoryCopy } from '../../content'

import type { DeleteProductDialogProps } from './DeleteProductDialog.types'

const { remove } = inventoryCopy

/**
 * Confirmación de baja de un producto.
 *
 * El error se muestra acá dentro y el diálogo queda abierto: el caso real es el
 * 409 del backend —el producto tiene ventas o transferencias y no se puede
 * borrar—, y cerrar el diálogo para mostrar el aviso en otro lado dejaría al
 * usuario sin saber sobre qué producto fue.
 */
export function DeleteProductDialog({
  product,
  deleting = false,
  blocked = false,
  onConfirm,
  onClose,
}: DeleteProductDialogProps) {
  // El diálogo se cierra con un fundido, y durante ese fundido `product` ya es
  // `undefined`: sin guardar el último, el texto desaparecía y la caja se
  // encogía mientras se iba. Se actualiza en el render, sin efecto.
  const [shown, setShown] = useState(product)
  if (product !== undefined && product !== shown) setShown(product)

  return (
    <ConfirmDialog
      open={product !== undefined}
      tone="destructive"
      title={remove.title}
      description={shown === undefined ? undefined : remove.body(shown.name, shown.sku)}
      confirmLabel={remove.confirm}
      cancelLabel={remove.cancel}
      closeLabel={remove.close}
      busy={deleting}
      // Con el borrado ya rechazado la confirmación desaparece: reintentar lo
      // mismo va a fallar igual, y dejarla invita a insistir.
      canConfirm={!blocked}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {blocked ? <Alert severity="error">{remove.blocked}</Alert> : null}
    </ConfirmDialog>
  )
}
