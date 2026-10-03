import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { Box, Button, Typography } from '@mui/material'

import { ordersCopy } from '../content'
import type { Shipment } from '../types'

const labelCopy = ordersCopy.detail.shipping.label

interface ShippingLabelFieldProps {
  /** El envío resuelto, o null mientras no hay uno que mostrar. */
  shipment: Shipment | null
}

/**
 * Etiqueta de envío del panel de S08 (RF-23).
 *
 * Es el rótulo que emite el courier al confirmar el despacho: el PDF con el
 * código de barras que se imprime y se pega al paquete. El backend lo guarda
 * desde TESIS-47 (`shipments.shipping_label_url`) y hasta esta card no se veía
 * en ninguna pantalla.
 *
 * Tres estados y ningún hueco: sin despachar dice que está pendiente, porque la
 * etiqueta la emite el courier; despachado sin etiqueta lo dice también, en vez
 * de dejar el campo vacío como si se hubiera perdido; y con etiqueta, el enlace.
 *
 * Abre en una pestaña nueva porque el destino es el sitio del courier y no una
 * ruta de la app, con `rel="noopener noreferrer"` para no entregarle la
 * referencia a esta ventana.
 */
export function ShippingLabelField({ shipment }: ShippingLabelFieldProps) {
  const dispatched = shipment !== null && shipment.trackingNumber !== null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography variant="labelSm" color="text.secondary">
        {labelCopy.title}
      </Typography>

      {shipment !== null && shipment.labelUrl !== null ? (
        <Button
          component="a"
          href={shipment.labelUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="outlined"
          startIcon={<PrintOutlinedIcon />}
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
