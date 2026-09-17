import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

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
  return (
    <Dialog open={product !== undefined} onClose={deleting ? undefined : onClose}>
      <DialogTitle>{remove.title}</DialogTitle>
      <DialogContent>
        {product === undefined ? null : (
          <DialogContentText>{remove.body(product.name, product.sku)}</DialogContentText>
        )}
        {blocked ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {remove.blocked}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose} disabled={deleting}>
          {remove.cancel}
        </Button>
        {/* Con el borrado ya rechazado el botón desaparece: reintentar lo mismo
            va a fallar igual, y dejarlo invita a insistir. */}
        {blocked ? null : (
          <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}>
            {remove.confirm}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
