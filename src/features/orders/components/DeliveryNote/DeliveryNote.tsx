import { GlobalStyles, Portal, Typography } from '@mui/material'
import { formatInteger } from 'shared/utils'

import { ordersCopy } from '../../content'
import { formatOrderDate } from '../../utils/format'
import { totalUnits } from '../../utils/payment'

import {
  LinesTable,
  Mono,
  NoteHeader,
  NoteMeta,
  NoteRoot,
  NoteSection,
  SectionTitle,
  Signatures,
  printOnlyStyles,
} from './DeliveryNote.styles'
import type { DeliveryNoteProps } from './DeliveryNote.types'

const copy = ordersCopy.detail.deliveryNote

/** Las líneas del domicilio que la orden tenga: ninguna se inventa. */
function addressLines(order: DeliveryNoteProps['order']): string[] {
  const locality = [order.customerCity, order.customerProvince].filter(Boolean).join(', ')

  return [
    order.customerAddress,
    order.customerZipCode === null ? null : copy.zipCode(order.customerZipCode),
    locality === '' ? null : locality,
  ].filter((line): line is string => line !== null)
}

/**
 * El remito de la orden, para imprimir con `window.print()`.
 *
 * No es una pantalla: en el navegador no se ve, y al imprimir es lo único que
 * sale. Va en un portal directo al `<body>` para que la hoja de impresión pueda
 * esconder todo lo demás —el shell, la sidebar, el detalle— con una sola regla
 * sobre los hijos del `body`.
 *
 * Sin precios: el remito acompaña a la mercadería y dice qué se entrega, no
 * cuánto costó. Eso es de la factura, que el proyecto no emite.
 */
export function DeliveryNote({ order, orderLabel, companyName, issuedAt }: DeliveryNoteProps) {
  const address = addressLines(order)

  return (
    <Portal>
      <GlobalStyles styles={printOnlyStyles()} />
      <NoteRoot data-delivery-note="">
        <NoteHeader>
          <div>
            {companyName === undefined ? null : (
              <Typography variant="h2" component="p">
                {companyName}
              </Typography>
            )}
            <Typography variant="h1" component="h1">
              {copy.title}
            </Typography>
          </div>
          <NoteMeta>
            <Typography variant="bodyLg">
              {copy.order} <Mono>{orderLabel}</Mono>
            </Typography>
            <Typography variant="bodyMd">{copy.issuedAt(formatOrderDate(issuedAt))}</Typography>
            <Typography variant="bodyMd">
              {copy.orderedAt(formatOrderDate(order.createdAt))}
            </Typography>
          </NoteMeta>
        </NoteHeader>

        <NoteSection>
          <SectionTitle>{copy.customer}</SectionTitle>
          <Typography variant="bodyLg">{order.customerName}</Typography>
          {order.customerDocument === null ? null : (
            <Typography variant="bodyMd">{copy.document(order.customerDocument)}</Typography>
          )}
          {order.customerPhone === null ? null : (
            <Typography variant="bodyMd">{copy.phone(order.customerPhone)}</Typography>
          )}
        </NoteSection>

        <NoteSection>
          <SectionTitle>{order.requiresShipping ? copy.deliverTo : copy.pickup}</SectionTitle>
          {/* Un retiro no tiene domicilio de entrega: el cliente lo lleva en mano. */}
          {order.requiresShipping
            ? address.map((line) => (
                <Typography key={line} variant="bodyMd">
                  {line}
                </Typography>
              ))
            : null}
          {order.requiresShipping && address.length === 0 ? (
            <Typography variant="bodyMd">{copy.noAddress}</Typography>
          ) : null}
        </NoteSection>

        <NoteSection>
          <LinesTable>
            <thead>
              <tr>
                <th scope="col">{copy.columns.sku}</th>
                <th scope="col">{copy.columns.product}</th>
                <th scope="col">{copy.columns.quantity}</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    <Mono>{line.sku}</Mono>
                  </td>
                  <td>{line.productName}</td>
                  <td>{formatInteger(line.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>{copy.totalUnits}</td>
                <td>{formatInteger(totalUnits(order.lines))}</td>
              </tr>
            </tfoot>
          </LinesTable>
        </NoteSection>

        <Signatures>
          <Typography variant="bodyMd">{copy.signature}</Typography>
          <Typography variant="bodyMd">{copy.clarification}</Typography>
        </Signatures>
      </NoteRoot>
    </Portal>
  )
}
