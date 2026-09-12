import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Link, Typography } from '@mui/material'
import { DataTable, StatusBadge } from 'shared/components'
import type { DataTableAction, DataTableColumn } from 'shared/components'

import { formatUnits, inventoryCopy } from '../../content'
import type { ProductSummary } from '../../types'
import { stockLabel, stockRowTone, stockVariant } from '../../utils/stockStatus'

import type { InventoryTableProps } from './InventoryTable.types'

const { columns: columnCopy, cells, actions: actionCopy, page } = inventoryCopy

/** Celda de dos líneas: el dato arriba y su contexto abajo, atenuado. */
function Stacked({ primary, secondary }: { primary: string; secondary?: string | null }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography variant="body2" noWrap>
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
          {secondary}
        </Typography>
      ) : null}
    </Box>
  )
}

function buildColumns(
  onView: (product: ProductSummary) => void,
): DataTableColumn<ProductSummary>[] {
  return [
    {
      id: 'sku',
      header: columnCopy.sku,
      width: 140,
      render: (product) => (
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => onView(product)}
          sx={{ fontFamily: 'monospace', fontSize: 14, textAlign: 'left' }}
        >
          {product.sku}
        </Link>
      ),
    },
    { id: 'name', header: columnCopy.name, render: (product) => product.name },
    {
      id: 'category',
      header: columnCopy.category,
      width: 130,
      render: (product) =>
        product.category === null ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {cells.noCategory}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {product.category}
          </Typography>
        ),
    },
    {
      id: 'available',
      header: columnCopy.available,
      align: 'right',
      width: 150,
      // Las unidades en tránsito van debajo y no sumadas: salieron de un
      // depósito y todavía no llegaron a otro, así que no son stock disponible
      // en ningún nodo. Sumarlas diría que hay mercadería que no está.
      render: (product) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {formatUnits(product.totalStock)}
          </Typography>
          {product.inTransitQuantity > 0 ? (
            <Typography variant="caption" sx={{ color: 'info.main' }}>
              {cells.inTransit(product.inTransitQuantity)}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      id: 'status',
      header: columnCopy.status,
      width: 128,
      render: (product) => (
        <StatusBadge
          status={stockVariant(product.stockStatus)}
          label={stockLabel(product.stockStatus)}
        />
      ),
    },
    {
      id: 'warehouse',
      header: columnCopy.warehouse,
      width: 160,
      render: (product) =>
        product.primaryWarehouse === null ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {cells.noWarehouse}
          </Typography>
        ) : (
          <Stacked
            primary={product.primaryWarehouse.name}
            secondary={
              product.warehouseCount > 1 ? cells.moreWarehouses(product.warehouseCount) : null
            }
          />
        ),
    },
  ]
}

/**
 * Tabla del catálogo maestro.
 *
 * Es presentacional: no consulta nada ni conoce los filtros. Recibe las filas y
 * los callbacks, y lo único que decide es cómo se ve cada celda.
 */
export function InventoryTable({
  products,
  tabs,
  activeTabId,
  onTabChange,
  pagination,
  onView,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const actions: DataTableAction<ProductSummary>[] = [
    {
      id: 'view',
      label: actionCopy.view,
      icon: <VisibilityOutlinedIcon fontSize="small" />,
      onSelect: onView,
    },
    {
      id: 'edit',
      label: actionCopy.edit,
      icon: <EditOutlinedIcon fontSize="small" />,
      onSelect: onEdit,
    },
    {
      id: 'delete',
      label: actionCopy.delete,
      icon: <DeleteOutlineIcon fontSize="small" />,
      tone: 'danger',
      onSelect: onDelete,
    },
  ]

  return (
    <DataTable
      columns={buildColumns(onView)}
      rows={products}
      getRowId={(product) => product.id}
      label={page.tableLabel}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      rowTone={(product) => stockRowTone(product.stockStatus)}
      actions={actions}
      actionsHeader={columnCopy.actions}
      getActionsLabel={(product) => actionCopy.menuFor(product.sku)}
      pagination={pagination}
      paginationLabels={{
        previousLabel: inventoryCopy.pagination.previous,
        nextLabel: inventoryCopy.pagination.next,
        pageLabel: inventoryCopy.pagination.page,
      }}
      emptyMessage={page.empty}
    />
  )
}
