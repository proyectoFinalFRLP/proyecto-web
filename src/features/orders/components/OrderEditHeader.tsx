import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { StatusBadge } from 'shared/components'
import type { StatusVariant } from 'shared/components'

import { ordersCopy } from '../content'

// Mismas piezas que el encabezado del detalle (S08): S09 es esa misma cabecera
// con un tramo más en la ruta y otras acciones.
import {
  Actions,
  CurrentCrumb,
  Crumbs,
  OrderTitle,
  TitleRow,
} from './OrderDetailHeader/OrderDetailHeader.styles'

const { edit } = ordersCopy

export interface OrderEditHeaderProps {
  orderLabel: string
  ordersPath: string
  detailPath: string
  /** El estado elegido en el formulario, no el guardado: cambia en el acto. */
  statusLabel: string
  statusVariant: StatusVariant
  saving: boolean
  saveDisabled: boolean
  onDiscard: () => void
  onSave: () => void
}

/**
 * Encabezado de S09: ruta de navegación hasta la orden, «Modificar #…» con el
 * estado que tendrá al guardar, y las dos acciones de la pantalla.
 */
export function OrderEditHeader({
  orderLabel,
  ordersPath,
  detailPath,
  statusLabel,
  statusVariant,
  saving,
  saveDisabled,
  onDiscard,
  onSave,
}: OrderEditHeaderProps) {
  return (
    <Box>
      <Crumbs
        aria-label={edit.breadcrumb.label}
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link to={ordersPath}>{edit.breadcrumb.orders}</Link>
        <Link to={detailPath}>{orderLabel}</Link>
        <CurrentCrumb aria-current="page">{edit.breadcrumb.current}</CurrentCrumb>
      </Crumbs>

      <TitleRow>
        <OrderTitle variant="h1" component="h1">
          {edit.title(orderLabel)}
        </OrderTitle>
        <StatusBadge status={statusVariant} label={statusLabel} size="lg" />

        <Actions>
          <Button variant="outlined" startIcon={<CloseIcon />} onClick={onDiscard}>
            {edit.discard}
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            disabled={saveDisabled || saving}
            onClick={onSave}
          >
            {saving ? edit.saving : edit.save}
          </Button>
        </Actions>
      </TitleRow>
    </Box>
  )
}
