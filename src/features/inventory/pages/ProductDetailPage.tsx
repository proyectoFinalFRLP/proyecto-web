import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import { notify, useTenantFeature } from 'shared/store'

import { EditProductModal } from '../components/EditProductModal'
import type { EditScope } from '../components/EditProductModal'
import { MasterStockCard } from '../components/MasterStockCard'
import type { StockBucket } from '../components/MasterStockCard'
import { ProductDetailHeader } from '../components/ProductDetailHeader'
import { ProductSpecsCard } from '../components/ProductSpecsCard'
import type { ProductSpec } from '../components/ProductSpecsCard'
import { SalesChannelsCard } from '../components/SalesChannelsCard'
import { WarehouseDistributionCard } from '../components/WarehouseDistributionCard'
import type { WarehouseDistributionRow } from '../components/WarehouseDistributionCard'
import { inventoryCopy } from '../content'
import {
  CONFLICT_STATUS,
  useCategories,
  useProduct,
  useUpdateProduct,
  useWarehouses,
} from '../hooks/useInventory'
import type { Product, UpdateProductPayload } from '../types'
import { describeConflict } from '../utils/conflict'
import { parseDimensions } from '../utils/dimensions'
import { formatSpecTimestamp, formatUnits, formatWeight } from '../utils/format'
import { distributionPositions } from '../utils/stock'
import { stockLabel, stockRowTone, stockVariant } from '../utils/stockStatus'

const { detail, page } = inventoryCopy
const { specs: specsCopy, master: masterCopy, distribution: distributionCopy } = detail

// Ruta del catálogo. Las rutas se registran en `app/router/routes.tsx`, capa que
// una feature no puede importar (ver architecture.md §3.2), así que el destino
// del breadcrumb se declara acá.
const CATALOG_PATH = '/inventory'
// Misma razón: la pantalla de integraciones, a la que manda la tarjeta de
// canales cuando no hay ninguno conectado.
const INTEGRATIONS_PATH = '/integrations'

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
    // Los tres salen de la API: categoría de TESIS-150, empaque y norma de
    // TESIS-162. Un producto puede no tenerlos cargados, y ahí sí va el «—»: la
    // diferencia es que ahora es un dato que falta y no una columna que no
    // existe.
    {
      id: 'category',
      label: specsCopy.fields.category,
      value: product.category ?? specsCopy.unknown,
      unknown: product.category === null,
    },
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
    {
      id: 'packaging',
      label: specsCopy.fields.packaging,
      value: product.packaging ?? specsCopy.unknown,
      unknown: product.packaging === null,
    },
  ]
}

/** Fila de abajo del divisor: norma técnica y marca temporal. */
function buildSecondarySpecs(product: Product): ProductSpec[] {
  const updatedAt = formatSpecTimestamp(product.updatedAt)

  return [
    {
      id: 'standard',
      label: specsCopy.fields.standard,
      value: product.technicalStandard ?? specsCopy.unknown,
      unknown: product.technicalStandard === null,
    },
    {
      id: 'updatedAt',
      label: specsCopy.fields.updatedAt,
      value: updatedAt ?? specsCopy.unknown,
      unknown: updatedAt === null,
    },
  ]
}

/**
 * Desglose por estado de reserva, con los números que calcula la API desde
 * TESIS-162.
 *
 * Las tres cubetas mostraban «—» con la aclaración de que el modelo no las
 * registraba. Ahora muestran dato, y **cero cuando el valor es cero**: un
 * producto que nadie reservó tiene 0 comprometido, que es un hecho y no una
 * carencia. Ninguna se deriva acá: `onHand` no es la suma de `stocks[]`, porque
 * lo vendido sin despachar ya salió de esas filas y sigue en el estante.
 *
 * El en tránsito sigue **fuera** del total: son unidades que salieron de un
 * depósito y no llegaron a otro, y el backend las deja fuera de `total_stock`.
 */
function buildBuckets(product: Product): StockBucket[] {
  return [
    {
      id: 'committed',
      label: masterCopy.buckets.committed,
      icon: <LockOutlinedIcon fontSize="small" color="action" />,
      value: formatUnits(product.committed),
    },
    {
      id: 'inTransit',
      label: masterCopy.buckets.inTransit,
      icon: <LocalShippingOutlinedIcon fontSize="small" color="action" />,
      value: formatUnits(product.inTransitQuantity),
    },
    {
      id: 'availableToPromise',
      label: masterCopy.buckets.availableToPromise,
      icon: <CheckCircleOutlineIcon fontSize="small" color="action" />,
      value: formatUnits(product.availableToPromise),
      accent: true,
    },
  ]
}

/**
 * Filas de la tabla, de mayor a menor cantidad como en el diseño. El estado de
 * cada fila lo manda el backend; el resalte sigue el criterio del catálogo.
 */
function buildRows(product: Product): WarehouseDistributionRow[] {
  return distributionPositions(product).map((position) => ({
    id: position.warehouseId,
    name: position.name,
    location: position.location ?? specsCopy.unknown,
    committed: formatUnits(position.committed),
    inTransit: formatUnits(position.incoming),
    onHand: formatUnits(position.quantity),
    statusLabel: stockLabel(position.stockStatus),
    statusVariant: stockVariant(position.stockStatus),
    critical: stockRowTone(position.stockStatus) === 'critical',
  }))
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
  // El catálogo (S10) tiene «Ver» y «Editar» en el menú de cada fila, y las dos
  // llevan acá. `state.edit` es lo único que las distingue: abre el formulario
  // al llegar en vez de mostrar sólo la ficha.
  //
  // Se lee como valor inicial del estado y no con un efecto: el efecto pintaría
  // la ficha durante un render antes de abrir el modal, y además dejaría el
  // formulario reapareciendo cada vez que el usuario lo cierra.
  const { pathname, state } = useLocation()
  const navigate = useNavigate()
  const abrirEdicion = typeof state === 'object' && state !== null && 'edit' in state
  // Qué alcance abre el modal, o `null` si está cerrado: «Editar producto»
  // abre el formulario entero y «Editar stock» sólo las cantidades.
  const [editing, setEditing] = useState<EditScope | null>(abrirEdicion ? 'product' : null)
  const integrationsEnabled = useTenantFeature('integrations')

  // La intención se consume una sola vez. `location.state` vive en
  // `history.state`, que el navegador conserva al recargar y al ir y volver:
  // sin borrarla, cerrar el formulario y apretar F5 lo vuelve a abrir solo,
  // porque el estado inicial se recalcula desde la misma señal.
  useEffect(() => {
    if (!abrirEdicion) return

    void navigate(pathname, { replace: true, state: null })
  }, [abrirEdicion, navigate, pathname])
  // Estado del producto cuando el modal lo abrió. Se guarda para poder decir
  // QUÉ cambió si la API rechaza el guardado por versión vieja (TESIS-101).
  const [baseline, setBaseline] = useState<Product | undefined>(undefined)

  // Un `:productId` que no es un entero positivo no llega a la API: la query
  // queda deshabilitada y la pantalla resuelve en "no encontrado".
  const parsedId = Number(productId)
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined

  const product = useProduct(id)
  const warehouses = useWarehouses()
  const categories = useCategories()
  const updateMutation = useUpdateProduct(id, product.data?.version ?? null)

  // El 412 llega con la versión ya invalidada: React Query refetchea el detalle
  // y de esa lectura sale la comparación contra lo que el modal había abierto.
  const isConflict = updateMutation.error?.status === CONFLICT_STATUS
  // `isFetching` es load-bearing: mientras el refetch está en vuelo `product.data`
  // sigue siendo la lectura vieja, o sea el mismo objeto que `baseline`.
  // Compararlos ahí da una lista vacía, y el modal mostraba "no pudimos
  // determinar qué cambió" por un render antes de decir la verdad.
  const conflict =
    isConflict && baseline !== undefined && product.data !== undefined && !product.isFetching
      ? describeConflict(baseline, product.data, inventoryCopy.modal.conflict.labels)
      : undefined

  // La foto del estado de partida se saca al GUARDAR y no al abrir: en este
  // momento `product.data` es todavía lo que el usuario estaba editando, y el
  // refetch que dispara el error llega después. Evita un efecto que sincronice
  // estado —que además ESLint rechaza— para obtener exactamente el mismo dato.
  function save(payload: UpdateProductPayload) {
    if (product.data !== undefined) setBaseline(product.data)
    const name = product.data?.name ?? ''
    updateMutation.mutate(payload, {
      onSuccess: () => {
        notify(page.saved(name), 'success')
        setEditing(null)
        setBaseline(undefined)
      },
      onError: () => void product.refetch(),
    })
  }

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

  return (
    <PageWrapper>
      <Stack spacing={2}>
        <ProductDetailHeader
          sku={product.data.sku}
          name={product.data.name}
          statusLabel={stockLabel(product.data.stockStatus)}
          statusVariant={stockVariant(product.data.stockStatus)}
          catalogPath={CATALOG_PATH}
          onEdit={() => setEditing('product')}
        />

        <ProductSpecsCard
          specs={buildSpecs(product.data)}
          secondarySpecs={buildSecondarySpecs(product.data)}
        />

        <Box sx={CONTENT_GRID}>
          {/* El titular es `onHand` y no `totalStock`: las cubetas lo
              descomponen —comprometido + disponible para prometer— y
              `totalStock` es sólo la segunda, así que encabezar con él dejaba
              la tarjeta sin cerrar. El en tránsito queda afuera a propósito:
              esas unidades no están en ningún depósito todavía.
              El epígrafe cuenta las posiciones y no `stocks`, porque un
              depósito puede quedarse sin fila de stock y seguir teniendo
              unidades vendidas sin despachar. */}
          <MasterStockCard
            totalLabel={formatUnits(product.data.onHand)}
            caption={masterCopy.warehouseCount(distributionPositions(product.data).length)}
            buckets={buildBuckets(product.data)}
            onEditStock={() => setEditing('stock')}
          />
          <WarehouseDistributionCard
            rows={buildRows(product.data)}
            footnote={distributionCopy.pendingInTransit}
          />
        </Box>

        {/* Canales de venta: sólo para las empresas con la feature encendida,
            igual que la ruta de integraciones (TESIS-121). */}
        {integrationsEnabled ? (
          <SalesChannelsCard productId={product.data.id} integrationsPath={INTEGRATIONS_PATH} />
        ) : null}

        {/* El 412 no es un error a mostrar acá: lo explica el propio modal, que
            queda abierto con lo que el usuario cargó. La condición mira
            `isConflict` y no `conflict`, que es `undefined` también mientras se
            resuelve el refetch: con lo otro, el 412 se filtraba a este banner
            durante ese render. */}
        {updateMutation.isError && !isConflict ? (
          <Typography variant="bodyMd" role="alert" sx={{ color: 'error.main' }}>
            {updateMutation.error.message}
          </Typography>
        ) : null}
      </Stack>

      <EditProductModal
        open={editing !== null}
        scope={editing ?? 'product'}
        product={product.data}
        warehouses={warehouses.data}
        categories={categories.data}
        submitting={updateMutation.isPending}
        conflict={conflict}
        onClose={() => {
          // Sin el reset, el error de la mutación sobrevive al modal y queda
          // colgado en la página — un 412 que ya no aplica a nada visible.
          updateMutation.reset()
          setEditing(null)
          setBaseline(undefined)
        }}
        onSubmit={save}
      />
    </PageWrapper>
  )
}
