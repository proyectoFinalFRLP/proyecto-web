import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { Box, Button, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'
import { StatusBadge } from 'shared/components'

import { ordersCopy } from '../../content'

import { Actions, CurrentCrumb, Crumbs, OrderTitle, TitleRow } from './OrderDetailHeader.styles'
import type { OrderDetailHeaderProps } from './OrderDetailHeader.types'

const { breadcrumb, actions, title } = ordersCopy.detail.header

/**
 * Encabezado de S08: ruta de navegación, identidad de la orden con su estado y
 * las acciones de la pantalla.
 *
 * Presentacional — el estado llega ya resuelto en props (ver `headerStatus`).
 */
export function OrderDetailHeader({
  orderLabel,
  statusLabel,
  statusVariant,
  ordersPath,
  onModify,
}: OrderDetailHeaderProps) {
  return (
    <Box>
      <Crumbs
        aria-label={breadcrumb.label}
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link to={ordersPath}>{breadcrumb.orders}</Link>
        {/* Último tramo: no es un enlace — es dónde estamos parados. */}
        <CurrentCrumb aria-current="page">{orderLabel}</CurrentCrumb>
      </Crumbs>

      <TitleRow>
        <OrderTitle variant="h1" component="h1">
          {title(orderLabel)}
        </OrderTitle>
        <StatusBadge status={statusVariant} label={statusLabel} size="lg" />

        <Actions>
          {/* El botón deshabilitado no dispara eventos de puntero, así que el
              Tooltip necesita un envoltorio propio para recibir el hover. */}
          <Tooltip title={actions.printPending}>
            <Box component="span">
              <Button variant="outlined" startIcon={<PrintOutlinedIcon />} disabled>
                {actions.print}
              </Button>
            </Box>
          </Tooltip>
          <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onModify}>
            {actions.modify}
          </Button>
        </Actions>
      </TitleRow>
    </Box>
  )
}
