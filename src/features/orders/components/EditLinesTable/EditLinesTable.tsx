import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { DataTable } from 'shared/components'
import type { DataTableColumn } from 'shared/components'

import { ordersCopy } from '../../content'
import { isLocked, isQuantityValid } from '../../utils/edit'
import type { EditLine, StockShortfall } from '../../utils/edit'
import { formatMoney } from '../../utils/format'
import { lineSubtotal } from '../../utils/payment'

import { StockWarnings } from './EditLinesTable.styles'
import type { EditLinesTableProps } from './EditLinesTable.types'
import { QuantityStepper } from './QuantityStepper'

const { lines: copy } = ordersCopy.edit

// Un SKU o un importe partidos en dos renglones dejan de leerse como un dato.
const NO_WRAP = { whiteSpace: 'nowrap' } as const

// Las líneas que se pintan en rojo: las que aumentaron dentro de un grupo que
// no entra. La que bajó comparte el problema pero no la culpa, y marcarla
// mandaría al operador a la fila equivocada.
function flaggedKeys(shortfalls: StockShortfall[]): Set<string> {
  return new Set(shortfalls.flatMap((shortfall) => shortfall.lineKeys))
}

function warehouseLabel(line: EditLine, name: EditLinesTableProps['warehouseName']): string {
  return line.warehouseId === null ? copy.noWarehouse : name(line.warehouseId)
}

function buildColumns(
  { warehouseName, onQuantityChange, onRemove, readOnly }: EditLinesTableProps,
  flagged: ReadonlySet<string>,
): DataTableColumn<EditLine>[] {
  return [
    {
      id: 'sku',
      header: copy.columns.sku,
      width: 140,
      render: (line) => (
        <Typography variant="dataMono" color="primary.main" sx={NO_WRAP}>
          {line.sku}
        </Typography>
      ),
    },
    {
      id: 'product',
      header: copy.columns.product,
      render: (line) => <Typography variant="bodyMd">{line.name}</Typography>,
    },
    {
      id: 'warehouse',
      header: copy.columns.warehouse,
      width: 150,
      render: (line) => (
        <Typography
          variant="bodyMd"
          color={line.warehouseId === null ? 'text.disabled' : 'text.secondary'}
        >
          {warehouseLabel(line, warehouseName)}
        </Typography>
      ),
    },
    {
      id: 'unitPrice',
      header: copy.columns.unitPrice,
      align: 'right',
      width: 140,
      render: (line) => (
        <Typography variant="dataMono" sx={NO_WRAP}>
          {formatMoney(line.unitPrice)}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      header: copy.columns.quantity,
      align: 'center',
      width: 170,
      render: (line) => (
        <QuantityStepper
          line={line}
          invalid={!isQuantityValid(line.quantity) || flagged.has(line.key)}
          disabled={readOnly || isLocked(line)}
          onChange={(quantity) => onQuantityChange(line.key, quantity)}
        />
      ),
    },
    {
      id: 'subtotal',
      header: copy.columns.subtotal,
      align: 'right',
      width: 150,
      render: (line) => (
        <Typography variant="dataMono" sx={NO_WRAP}>
          {formatMoney(Number.isFinite(line.quantity) ? lineSubtotal(line) : 0)}
        </Typography>
      ),
    },
    {
      id: 'remove',
      header: copy.columns.remove,
      align: 'center',
      width: 80,
      render: (line) => <RemoveCell line={line} readOnly={readOnly} onRemove={onRemove} />,
    },
  ]
}

/**
 * La acción de quitar, fija en cada fila como en S09. No va en el menú de
 * acciones de la tabla porque ahí no se puede apagar por fila, y una línea sin
 * depósito registrado no se puede quitar: en su lugar se muestra un candado
 * con el motivo.
 */
function RemoveCell({
  line,
  readOnly,
  onRemove,
}: {
  line: EditLine
  readOnly: boolean
  onRemove: EditLinesTableProps['onRemove']
}) {
  if (isLocked(line)) {
    return (
      <Tooltip title={copy.locked}>
        <LockOutlinedIcon
          fontSize="small"
          sx={{ color: 'text.disabled' }}
          aria-label={copy.locked}
        />
      </Tooltip>
    )
  }

  return (
    <IconButton
      size="small"
      aria-label={copy.removeFor(line.sku)}
      disabled={readOnly}
      onClick={() => onRemove(line.key)}
      sx={{ color: 'error.main' }}
    >
      <DeleteOutlineIcon fontSize="small" />
    </IconButton>
  )
}

/**
 * Las líneas de la orden en edición (S09): cantidad con `−` / `+`, quitar y, en
 * la barra, sumar una línea nueva. Presentacional: la página es dueña de las
 * líneas y decide qué está de más para el stock.
 *
 * Debajo de la tabla va un aviso por cada línea que pide más unidades de las
 * que su depósito tiene libres, como en el diseño: el guardado queda apagado
 * hasta que se corrija, porque el backend lo rechazaría igual.
 */
export function EditLinesTable(props: EditLinesTableProps) {
  const { lines, shortfalls, warehouseName, toolbar } = props
  const flagged = flaggedKeys(shortfalls)

  return (
    <Stack spacing={1.5}>
      <DataTable
        title={copy.title}
        label={copy.tableLabel}
        columns={buildColumns(props, flagged)}
        rows={lines}
        getRowId={(line) => line.key}
        density="compact"
        rowTone={(line) => (flagged.has(line.key) ? 'critical' : 'default')}
        toolbarActions={toolbar}
        footer={lines.length === 0 ? undefined : copy.footer(lines.length)}
        emptyMessage={copy.empty}
      />
      {shortfalls.length === 0 ? null : (
        <StockWarnings role="alert">
          {shortfalls.map((shortfall) => (
            <Box key={shortfall.key}>
              <WarningAmberIcon aria-hidden />
              <Typography variant="bodyMd">
                {copy.overStock(
                  shortfall.sku,
                  warehouseName(shortfall.warehouseId),
                  shortfall.missing,
                  shortfall.lines,
                )}
              </Typography>
            </Box>
          ))}
        </StockWarnings>
      )}
    </Stack>
  )
}
