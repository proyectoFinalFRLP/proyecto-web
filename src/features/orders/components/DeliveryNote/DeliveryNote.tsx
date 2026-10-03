import { GlobalStyles, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { formatCount, ordersCopy } from '../../content'
import { formatOrderDate } from '../../utils/format'
import { totalUnits } from '../../utils/payment'

import {
  HeadCell,
  NoteHeader,
  NoteRoot,
  NoteSection,
  NoteTable,
  SignatureRow,
} from './DeliveryNote.styles'
import type { DeliveryNoteProps } from './DeliveryNote.types'

const copy = ordersCopy.detail.deliveryNote

/** Clase del contenedor: es lo único que queda visible al imprimir. */
const PRINT_ROOT_CLASS = 'delivery-note-print-root'

// Al imprimir, todo lo que cuelga del `<body>` se oculta salvo el remito. El
// remito va en un portal directo al `<body>` justamente para poder decir eso en
// una sola regla, sin depender de dónde lo monte la pantalla.
const PRINT_RULES = {
  '@media print': {
    [`body > *:not(.${PRINT_ROOT_CLASS})`]: { display: 'none !important' },
    [`.${PRINT_ROOT_CLASS}`]: { display: 'block !important' },
    '@page': { margin: '12mm' },
  },
}

function addressLine({
  customerAddress,
  customerZipCode,
  customerCity,
  customerProvince,
}: DeliveryNoteProps['order']) {
  return [customerAddress, customerZipCode, customerCity, customerProvince]
    .filter((part) => part !== null && part !== '')
    .join(', ')
}

/**
 * El remito de la orden: el documento que acompaña la mercadería y firma quien
 * la recibe.
 *
 * Se arma en el cliente con lo que el detalle ya tiene y se imprime con el
 * diálogo del navegador (que también permite guardarlo como PDF). No pasa por
 * la API: un remito no factura nada —por eso no lleva precios y dice «no válido
 * como factura»—, sólo lista qué se entrega y a quién.
 *
 * Se monta sólo para imprimir: al montarse abre el diálogo y avisa con
 * `onPrinted` cuando se cierra. Montado todo el tiempo, aunque oculto,
 * duplicaría en el DOM los textos de la pantalla.
 */
export function DeliveryNote({
  order,
  orderLabel,
  companyName,
  shipment,
  onPrinted,
}: DeliveryNoteProps) {
  const address = addressLine(order)

  // `afterprint` y no lo que viene después de `window.print()`: en algunos
  // navegadores la llamada no bloquea, y desmontar en seguida imprimiría la
  // página vacía.
  useEffect(() => {
    window.addEventListener('afterprint', onPrinted)
    window.print()

    return () => window.removeEventListener('afterprint', onPrinted)
  }, [onPrinted])

  return createPortal(
    <NoteRoot className={PRINT_ROOT_CLASS} data-testid="delivery-note">
      <GlobalStyles styles={PRINT_RULES} />

      <NoteHeader>
        <div>
          <Typography component="p" sx={{ fontSize: 18, fontWeight: 700 }}>
            {companyName}
          </Typography>
          <Typography component="p">{copy.notInvoice}</Typography>
        </div>
        <div>
          <Typography component="h1" sx={{ fontSize: 20, fontWeight: 700 }}>
            {copy.title}
          </Typography>
          <Typography component="p">{copy.order(orderLabel)}</Typography>
          <Typography component="p">{copy.date(formatOrderDate(order.createdAt))}</Typography>
        </div>
      </NoteHeader>

      <NoteSection>
        <div>
          <Typography component="p" sx={{ fontWeight: 700 }}>
            {copy.recipient}
          </Typography>
          <Typography component="p">{order.customerName}</Typography>
          {order.customerDocument === null ? null : (
            <Typography component="p">{copy.document(order.customerDocument)}</Typography>
          )}
          <Typography component="p">{address === '' ? copy.noAddress : address}</Typography>
        </div>
        <div>
          <Typography component="p" sx={{ fontWeight: 700 }}>
            {copy.shipping}
          </Typography>
          <Typography component="p">{shipment?.courier?.name ?? copy.noCourier}</Typography>
          <Typography component="p">
            {shipment?.trackingNumber === null || shipment === null
              ? copy.noTracking
              : copy.tracking(shipment.trackingNumber)}
          </Typography>
        </div>
      </NoteSection>

      <NoteTable size="small">
        <TableHead>
          <TableRow>
            <HeadCell>{copy.columns.sku}</HeadCell>
            <HeadCell>{copy.columns.product}</HeadCell>
            <HeadCell align="right">{copy.columns.quantity}</HeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>{line.sku}</TableCell>
              <TableCell>{line.productName}</TableCell>
              <TableCell align="right">{formatCount(line.quantity)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
              {copy.totalUnits}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {formatCount(totalUnits(order.lines))}
            </TableCell>
          </TableRow>
        </TableBody>
      </NoteTable>

      <SignatureRow>
        <div>{copy.signature.sign}</div>
        <div>{copy.signature.name}</div>
        <div>{copy.signature.document}</div>
      </SignatureRow>
    </NoteRoot>,
    document.body,
  )
}
