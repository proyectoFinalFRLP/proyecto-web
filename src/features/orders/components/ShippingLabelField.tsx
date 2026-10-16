import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { Box, Button, Typography } from '@mui/material'

import { ordersCopy } from '../content'
import { useShipmentLabel } from '../hooks/useShipmentLabel'
import type { Shipment } from '../types'

const labelCopy = ordersCopy.detail.shipping.label

interface ShippingLabelFieldProps {
  /** El envío resuelto, o null mientras no hay uno que mostrar. */
  shipment: Shipment | null
}

/**
 * Etiqueta de envío del panel de S08 (RF-23).
 *
 * Es el rótulo que emite el courier: el PDF con el código de barras que se
 * imprime y se pega al paquete. Desde TESIS-187 se pide a la API
 * (`GET /shipments/:id/label`), que lo trae del courier en el momento (OCA) o
 * redirige a la URL que dejó al despachar (Andreani). Ver `useShipmentLabel`.
 *
 * Tres estados y ningún hueco: sin despachar dice que está pendiente, porque la
 * etiqueta la emite el courier; despachado sin etiqueta (`labelAvailable` en
 * false) lo dice también, en vez de ofrecer un botón que contesta 404; y con
 * etiqueta, el botón para imprimirla.
 */
export function ShippingLabelField({ shipment }: ShippingLabelFieldProps) {
  const { print, printing } = useShipmentLabel()
  const dispatched = shipment !== null && shipment.trackingNumber !== null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography variant="labelSm" color="text.secondary">
        {labelCopy.title}
      </Typography>

      {shipment?.labelAvailable ? (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PrintOutlinedIcon />}
          loading={printing}
          onClick={() => print(shipment)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {labelCopy.action}
        </Button>
      ) : (
        <Typography variant="bodyMd" color="text.disabled">
          {dispatched ? labelCopy.missing : labelCopy.pending}
        </Typography>
      )}
    </Box>
  )
}
