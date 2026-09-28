import { Alert, Button, Stack, Typography } from '@mui/material'
import { LoadingSpinner } from 'shared/components'

import { ordersCopy } from '../../content'
import { QuoteOptionList } from '../QuoteOptionList'

import type { QuoteOptionsPanelProps } from './QuoteOptionsPanel.types'

const { options: copy } = ordersCopy.carrier

/**
 * La cotización con sus estados: mientras consulta, si falló, si ningún
 * operador contestó y, cuando hay opciones, la lista para elegir. La usan el
 * paso 3 del alta (S07) y el despacho desde el detalle de la orden; se extrajo
 * cuando apareció el segundo (`feature-structure.md` §6).
 */
export function QuoteOptionsPanel({
  quotes,
  selectedId,
  onSelect,
  disabled = false,
  onReview,
}: QuoteOptionsPanelProps) {
  // Consultar a los operadores puede tardar lo que tarda el más lento: la
  // pantalla lo dice en vez de quedarse en blanco.
  if (quotes.isPending) {
    return (
      <Stack spacing={1} role="status" sx={{ alignItems: 'center', py: 4 }}>
        <LoadingSpinner />
        <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
          {copy.loading}
        </Typography>
      </Stack>
    )
  }

  // Un fallo y una lista vacía son dos cosas distintas: el primero es nuestro o
  // de la red, la segunda es que ningún operador contestó a tiempo. Las dos
  // dejan reintentar y, donde se puede, volver a revisar origen y destino.
  if (quotes.isError || quotes.data === undefined || quotes.data.length === 0) {
    return (
      <Alert
        severity={quotes.isError ? 'error' : 'warning'}
        variant="outlined"
        action={
          <Stack direction="row" spacing={1}>
            {onReview === undefined ? null : (
              <Button color="inherit" size="small" onClick={onReview}>
                {copy.review}
              </Button>
            )}
            <Button color="inherit" size="small" onClick={() => void quotes.refetch()}>
              {copy.retry}
            </Button>
          </Stack>
        }
      >
        {quotes.isError ? copy.error : copy.empty}
      </Alert>
    )
  }

  return (
    <QuoteOptionList
      quotes={quotes.data}
      selectedId={selectedId}
      onSelect={onSelect}
      disabled={disabled}
    />
  )
}
