import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Button, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { EditProductModal } from '../components/EditProductModal'
import { MasterStockCard } from '../components/MasterStockCard'
import type { StockBucket } from '../components/MasterStockCard'
import { ProductDetailHeader } from '../components/ProductDetailHeader'
import { ProductSpecsCard } from '../components/ProductSpecsCard'
import type { ProductSpec } from '../components/ProductSpecsCard'
import { WarehouseDistributionCard } from '../components/WarehouseDistributionCard'
import type { WarehouseDistributionRow } from '../components/WarehouseDistributionCard'
import { inventoryCopy } from '../content'
import { useProduct, useUpdateProduct, useWarehouses } from '../hooks/useInventory'
import type { Product } from '../types'
import { parseDimensions } from '../utils/dimensions'
import { formatSpecTimestamp, formatUnits, formatWeight } from '../utils/format'
import { STOCK_LEVEL_STATUS, sortByQuantityDesc, stockLevel, totalOnHand } from '../utils/stock'

const { detail, page } = inventoryCopy
const { specs: specsCopy, master: masterCopy, distribution: distributionCopy, status } = detail

// Ruta del catálogo. Las rutas se registran en `app/router/routes.tsx`, capa que
// una feature no puede importar (ver architecture.md §3.2), así que el destino
// del breadcrumb se declara acá.
const CATALOG_PATH = '/inventory'

// La grilla del diseño: columna fija para el stock maestro y el resto para la
// distribución. En pantallas angostas se apilan.
const CONTENT_GRID = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
  alignItems: 'stretch',
}

/** Cuadrícula de especificaciones. Lo que la API no expone se muestra sin dato. */
function buildSpecs(product: Product): ProductSpec[] {
  const dimensions = parseDimensions(product.dimensions)
  const hasDimensions = product.dimensions !== null && product.dimensions !== ''

  return [
    // `products` no tiene columna de categoría (las cuatro de Product::CATEGORIES
    // viven en el backend pero no llegan en el serializer), ni empaque, ni norma
    // técnica. Se muestran los rótulos del diseño sin valor, en vez de omitir las
    // celdas: así la ficha dice qué falta en lugar de disimularlo.
    { id: 'category', label: specsCopy.fields.category, value: specsCopy.unknown, unknown: true },
    {
      id: 'weight',
      label: specsCopy.fields.weight,
      value: specsCopy.weightValue(formatWeight(product.weight)),
      mono: true,
    },
    {
      id: 'dimensions',
      label: specsCopy.fields.dimensions,
      value: hasDimensions
        ? specsCopy.dimensionsValue(
            formatUnits(dimensions.length),
            formatUnits(dimensions.width),
            formatUnits(dimensions.height),
          )
        : specsCopy.unknown,
      mono: true,
      unknown: !hasDimensions,
    },
    { id: 'packaging', label: specsCopy.fields.packaging, value: specsCopy.unknown, unknown: true },
  ]
}

/** Fila de abajo del divisor: norma técnica y marca temporal. */
function buildSecondarySpecs(product: Product): ProductSpec[] {
  const updatedAt = formatSpecTimestamp(product.updatedAt)

  return [
    { id: 'standard', label: specsCopy.fields.standard, value: specsCopy.unknown, unknown: true },
    {
      id: 'updatedAt',
      label: specsCopy.fields.updatedAt,
      value: updatedAt ?? specsCopy.unknown,
      unknown: updatedAt === null,
    },
  ]
}

/**
 * Desglose por estado de reserva.
 *
 * Las tres cubetas van sin dato: la API devuelve un solo número por depósito
 * (las unidades en depósito) y no modela reservas ni mercadería en tránsito.
 * Ver el encabezado de `utils/stock.ts`.
 */
function buildBuckets(): StockBucket[] {
  return [
    {
      id: 'committed',
      label: masterCopy.buckets.committed,
      icon: <LockOutlinedIcon fontSize="small" color="disabled" />,
      value: specsCopy.unknown,
      unknown: true,
    },
    {
      id: 'inTransit',
      label: masterCopy.buckets.inTransit,
      icon: <LocalShippingOutlinedIcon fontSize="small" color="disabled" />,
      value: specsCopy.unknown,
      unknown: true,
    },
    {
      id: 'availableToPromise',
      label: masterCopy.buckets.availableToPromise,
      icon: <CheckCircleOutlineIcon fontSize="small" color="disabled" />,
      value: specsCopy.unknown,
      unknown: true,
      accent: true,
    },
  ]
}

/** Filas de la tabla, de mayor a menor cantidad como en el diseño. */
function buildRows(product: Product): WarehouseDistributionRow[] {
  return sortByQuantityDesc(product.stocks).map((stock) => {
    const level = stockLevel(stock.quantity)

    return {
      id: stock.warehouseId,
      name: stock.warehouse.name,
      location: stock.warehouse.address,
      committed: specsCopy.unknown,
      inTransit: specsCopy.unknown,
      onHand: formatUnits(stock.quantity),
      statusLabel: status[level],
      statusVariant: STOCK_LEVEL_STATUS[level],
      critical: level === 'critical' || level === 'out',
    }
  })
}

/**
 * Detalle de producto (S12) — especificaciones, stock agregado y distribución
 * por depósito del SKU.
 *
 * Los datos salen de `GET /api/v1/products/:id`, que es lo único que hay: los
 * campos del diseño que la API todavía no expone se muestran sin dato en lugar
 * de rellenarse con un valor plausible.
 */
export function ProductDetailPage() {
  const { productId } = useParams()
  const [editing, setEditing] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)

  // Un `:productId` que no es un entero positivo no llega a la API: la query
  // queda deshabilitada y la pantalla resuelve en "no encontrado".
  const parsedId = Number(productId)
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined

  const product = useProduct(id)
  const warehouses = useWarehouses()
  const updateMutation = useUpdateProduct(id)

  if (id === undefined) {
    return (
      <PageWrapper>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="bodyLg">{detail.notFound}</Typography>
          <Button component={Link} to={CATALOG_PATH} variant="outlined">
            {detail.backToCatalog}
          </Button>
        </Stack>
      </PageWrapper>
    )
  }

  if (product.isPending || warehouses.isPending) return <LoadingSpinner fullScreen />

  if (product.isError || warehouses.isError) {
    return (
      <ErrorFallback
        error={product.error ?? warehouses.error ?? undefined}
        onRetry={() => {
          void product.refetch()
          void warehouses.refetch()
        }}
      />
    )
  }

  const total = totalOnHand(product.data.stocks)
  const level = stockLevel(total)

  return (
    <PageWrapper>
      <Stack spacing={2}>
        <ProductDetailHeader
          sku={product.data.sku}
          name={product.data.name}
          statusLabel={status[level]}
          statusVariant={STOCK_LEVEL_STATUS[level]}
          catalogPath={CATALOG_PATH}
          onEdit={() => setEditing(true)}
        />

        <ProductSpecsCard
          specs={buildSpecs(product.data)}
          secondarySpecs={buildSecondarySpecs(product.data)}
          footnote={specsCopy.pendingBackend}
        />

        <Box sx={CONTENT_GRID}>
          <MasterStockCard
            totalLabel={formatUnits(total)}
            caption={masterCopy.warehouseCount(product.data.stocks.length)}
            buckets={buildBuckets()}
            footnote={masterCopy.pending}
            onEditStock={() => setEditing(true)}
          />
          <WarehouseDistributionCard
            rows={buildRows(product.data)}
            footnote={distributionCopy.pending}
          />
        </Box>

        {updateMutation.isError ? (
          <Typography variant="bodyMd" role="alert" sx={{ color: 'error.main' }}>
            {updateMutation.error.message}
          </Typography>
        ) : null}
      </Stack>

      <EditProductModal
        open={editing}
        product={product.data}
        warehouses={warehouses.data}
        submitting={updateMutation.isPending}
        onClose={() => setEditing(false)}
        onSubmit={(payload) => {
          const name = product.data.name
          updateMutation.mutate(payload, {
            onSuccess: () => {
              setSavedName(name)
              setEditing(false)
            },
          })
        }}
      />

      <Snackbar
        open={savedName !== null}
        autoHideDuration={4000}
        onClose={() => setSavedName(null)}
        message={savedName === null ? undefined : page.saved(savedName)}
      />
    </PageWrapper>
  )
}
