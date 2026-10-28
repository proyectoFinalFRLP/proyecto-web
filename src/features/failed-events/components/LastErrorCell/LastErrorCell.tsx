import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { IconButton, Tooltip, Typography } from '@mui/material'

import { failedEventsCopy } from '../../content'
import type { FailedEvent } from '../../types'

import { CauseRow, Cell, CodeChip, Message } from './LastErrorCell.styles'

const { cells } = failedEventsCopy

interface LastErrorCellProps {
  event: FailedEvent
}

/**
 * «Último error» de la cola: el código de soporte y la causa en castellano,
 * con la referencia del evento debajo para dictársela a soporte.
 *
 * El texto técnico de la excepción (`lastError`) no se muestra: está en inglés,
 * nombra clases internas y no le dice al operador qué hacer. Queda detrás del
 * botón de detalle, en un tooltip, para quien sí lo sabe leer. Es un botón y no
 * el tooltip sobre el texto para que también llegue con el teclado.
 */
export function LastErrorCell({ event }: LastErrorCellProps) {
  const message =
    event.errorMessage ?? (event.lastError === null ? cells.noError : cells.unclassified)
  const context = [
    cells.reference(event.id),
    event.lastResponseStatus === null ? null : cells.httpStatus(event.lastResponseStatus),
  ]
    .filter((part) => part !== null)
    .join(' · ')

  return (
    <Cell>
      <CauseRow>
        {event.errorCode === null ? null : (
          <CodeChip size="small" variant="outlined" label={event.errorCode} />
        )}
        <Message variant="bodyMd">{message}</Message>
        {event.lastError === null ? null : (
          // `describeChild`: el nombre del botón es su aria-label y el texto
          // técnico va como descripción, no lo pisa.
          <Tooltip title={event.lastError} describeChild>
            <IconButton size="small" aria-label={cells.technicalDetailFor(event.id)}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CauseRow>
      <Typography variant="labelSm" sx={{ color: 'text.secondary' }}>
        {context}
      </Typography>
    </Cell>
  )
}
