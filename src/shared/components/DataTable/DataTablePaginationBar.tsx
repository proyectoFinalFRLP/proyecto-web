import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button, IconButton, Typography } from '@mui/material'

import { PageButtons, PaginationBar } from './DataTable.styles'
import type { DataTablePaginationBarProps } from './DataTable.types'

const PAGE_BUTTON = 32
// Cuántas páginas se listan alrededor de la actual antes de cortar con "…".
const WINDOW = 1
const ELLIPSIS = '…'

/**
 * Construye la lista de páginas visibles: siempre la primera y la última, más
 * una ventana alrededor de la actual, y "…" donde se saltea un tramo.
 *
 * Se calcula en vez de listar todo porque el diseño muestra "4.829 órdenes":
 * con ese volumen, pintar un botón por página no es una opción.
 */
function pageItems(page: number, pageCount: number): (number | typeof ELLIPSIS)[] {
  const pages = new Set<number>([1, pageCount])
  for (let p = page - WINDOW; p <= page + WINDOW; p += 1) {
    if (p >= 1 && p <= pageCount) pages.add(p)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items: (number | typeof ELLIPSIS)[] = []

  sorted.forEach((current, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && current - previous > 1) items.push(ELLIPSIS)
    items.push(current)
  })

  return items
}

export function DataTablePaginationBar({
  page,
  pageCount,
  summary,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
}: DataTablePaginationBarProps) {
  const items = pageItems(page, pageCount)

  return (
    <PaginationBar>
      <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
        {summary}
      </Typography>

      <PageButtons as="nav" aria-label={summary}>
        <IconButton
          aria-label={previousLabel}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="small"
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        {items.map((item, index) =>
          item === ELLIPSIS ? (
            // Separador decorativo: no es un control y no debe anunciarse.
            <Typography
              // eslint-disable-next-line react/no-array-index-key
              key={`gap-${index}`}
              aria-hidden
              sx={{ color: 'text.secondary', width: PAGE_BUTTON, textAlign: 'center' }}
            >
              {ELLIPSIS}
            </Typography>
          ) : (
            <Button
              key={item}
              onClick={() => onPageChange(item)}
              variant={item === page ? 'contained' : 'outlined'}
              color={item === page ? 'primary' : 'neutral'}
              aria-label={pageLabel(item)}
              aria-current={item === page ? 'page' : undefined}
              sx={{ minWidth: PAGE_BUTTON, width: PAGE_BUTTON, height: PAGE_BUTTON, px: 0 }}
            >
              {item}
            </Button>
          ),
        )}

        <IconButton
          aria-label={nextLabel}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          size="small"
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </PageButtons>
    </PaginationBar>
  )
}
