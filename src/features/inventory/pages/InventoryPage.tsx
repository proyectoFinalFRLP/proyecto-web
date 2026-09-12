import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableTab } from 'shared/components'
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue'

import { CreateProductModal } from '../components/CreateProductModal'
import { DeleteProductDialog } from '../components/DeleteProductDialog'
import { EditProductModal } from '../components/EditProductModal'
import { InventoryTable } from '../components/InventoryTable'
import { formatUnits, inventoryCopy } from '../content'
import {
  CATALOG_TABS,
  CONFLICT_STATUS,
  RESTRICTED_STATUS,
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useProductCounts,
  useProductPage,
  useUpdateProduct,
  useWarehouses,
} from '../hooks/useInventory'
import type { CatalogTabId } from '../hooks/useInventory'
import type { Product, ProductSummary, UpdateProductPayload } from '../types'
import { describeConflict } from '../utils/conflict'

const { page, createModal, tabs: tabCopy, pagination } = inventoryCopy

const PER_PAGE = 20

/** El copy de cada pestaña, por su id. El orden vive en `CATALOG_TABS`. */
const TAB_LABELS: Record<CatalogTabId, string> = {
  all: tabCopy.all,
  available: tabCopy.available,
  low: tabCopy.low,
  out_of_stock: tabCopy.out_of_stock,
}

/**
 * Catálogo maestro: pestañas por disponibilidad, búsqueda y paginación contra
 * `GET /api/v1/products`, más las altas, ediciones y bajas del producto.
 *
 * El estado de stock de cada fila lo decide el backend y no esta pantalla: el
 * umbral vive en el modelo, así que la pestaña y el badge no pueden discrepar.
 */
export function InventoryPage() {
  const navigate = useNavigate()
  const [tabId, setTabId] = useState<CatalogTabId>('all')
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<ProductSummary | undefined>(undefined)
  const [notice, setNotice] = useState<string | null>(null)
  // Estado del producto cuando el modal lo abrió. Se guarda para poder decir
  // QUÉ cambió si la API rechaza el guardado por versión vieja (TESIS-101).
  const [baseline, setBaseline] = useState<Product | undefined>(undefined)

  // Lo que se tipea actualiza el campo en el acto; lo que viaja a la API espera
  // a que la persona deje de escribir.
  const debouncedSearch = useDebouncedValue(search)

  const status = CATALOG_TABS.find((tab) => tab.id === tabId)?.status
  const products = useProductPage({
    page: pageNumber,
    perPage: PER_PAGE,
    status,
    search: debouncedSearch,
  })
  const counts = useProductCounts(debouncedSearch)
  const warehouses = useWarehouses()
  const product = useProduct(editingId)
  const updateMutation = useUpdateProduct(editingId, product.data?.version ?? null)
  const createMutation = useCreateProduct()
  const deleteMutation = useDeleteProduct()

  // El 412 llega con la versión ya invalidada: React Query refetchea el detalle
  // y de esa lectura sale la comparación contra lo que el modal había abierto.
  const isConflict = updateMutation.error?.status === CONFLICT_STATUS
  // `isFetching` es load-bearing: mientras el refetch está en vuelo
  // `product.data` sigue siendo la lectura vieja, o sea el mismo objeto que
  // `baseline`, y compararlos daría una lista vacía.
  const conflict =
    isConflict && baseline !== undefined && product.data !== undefined && !product.isFetching
      ? describeConflict(baseline, product.data, inventoryCopy.modal.conflict.labels)
      : undefined

  function save(payload: UpdateProductPayload) {
    if (product.data !== undefined) setBaseline(product.data)
    const name = product.data?.name ?? ''
    updateMutation.mutate(payload, {
      onSuccess: () => {
        setNotice(page.saved(name))
        setEditingId(undefined)
        setBaseline(undefined)
      },
      onError: () => void product.refetch(),
    })
  }

  // Cambiar de pestaña o de búsqueda vuelve a la primera página: quedarse en la
  // 7 de un filtro que ahora tiene 2 deja la tabla vacía sin motivo visible.
  function changeTab(nextTabId: string) {
    setTabId(nextTabId as CatalogTabId)
    setPageNumber(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPageNumber(1)
  }

  function openCreate() {
    // El error anterior no debe reaparecer sobre el SKU de un alta nueva.
    createMutation.reset()
    setCreating(true)
  }

  function askToRemove(target: ProductSummary) {
    deleteMutation.reset()
    setRemoving(target)
  }

  function confirmRemove() {
    if (removing === undefined) return

    const name = removing.name
    deleteMutation.mutate(removing.id, {
      onSuccess: () => {
        setNotice(page.deleted(name))
        setRemoving(undefined)
      },
    })
  }

  if (products.isPending || warehouses.isPending) return <LoadingSpinner fullScreen />

  if (products.isError || warehouses.isError) {
    return (
      <ErrorFallback
        error={products.error ?? warehouses.error ?? new Error(page.error)}
        onRetry={() => {
          void products.refetch()
          void warehouses.refetch()
        }}
      />
    )
  }

  const { products: rows, total } = products.data
  const pageCount = Math.max(Math.ceil(total / PER_PAGE), 1)
  // Con la tabla vacía el rango arranca en 0: "Mostrando 1 a 0" es una frase
  // rota.
  const from = total === 0 ? 0 : (pageNumber - 1) * PER_PAGE + 1
  const to = Math.min(pageNumber * PER_PAGE, total)

  const tabs: DataTableTab[] = CATALOG_TABS.map(({ id }, index) => ({
    id,
    label: TAB_LABELS[id],
    // Un contador que todavía no resolvió no muestra cero: mostraría un número
    // falso durante el primer render y luego saltaría al real.
    count: counts[index] === undefined ? undefined : formatUnits(counts[index]),
  }))

  return (
    <PageWrapper sx={{ maxWidth: 1400 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'flex-start' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {page.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {page.subtitle}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ ml: { md: 'auto' }, alignItems: 'center', flexShrink: 0 }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            label={page.searchLabel}
            placeholder={page.searchPlaceholder}
            sx={{ width: { xs: '100%', sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {createModal.open}
          </Button>
        </Stack>
      </Stack>

      <InventoryTable
        products={rows}
        tabs={tabs}
        activeTabId={tabId}
        onTabChange={changeTab}
        pagination={{
          page: pageNumber,
          pageCount,
          summary: pagination.summary(from, to, total),
          onPageChange: setPageNumber,
        }}
        onView={(target) => void navigate(`/inventory/${target.id}`)}
        onEdit={(target) => setEditingId(target.id)}
        onDelete={askToRemove}
      />

      <CreateProductModal
        open={creating}
        warehouses={warehouses.data}
        submitting={createMutation.isPending}
        // Un SKU repetido vuelve como 409: el modal queda abierto y marca el
        // campo en conflicto en vez de perder lo que el usuario cargó.
        submitError={createMutation.error?.message}
        onClose={() => setCreating(false)}
        onSubmit={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: (created) => {
              setNotice(page.saved(created.name))
              setCreating(false)
            },
          })
        }}
      />

      {/* El detalle trae los `stocks`, que el listado no incluye: hasta que
          resuelve no hay con qué poblar el formulario. */}
      {product.data === undefined ? null : (
        <EditProductModal
          open={editingId !== undefined}
          product={product.data}
          warehouses={warehouses.data}
          submitting={updateMutation.isPending}
          conflict={conflict}
          onClose={() => {
            // Sin el reset, el error de la mutación sobrevive al modal y queda
            // colgado en la página — un 412 que ya no aplica a nada visible.
            updateMutation.reset()
            setEditingId(undefined)
            setBaseline(undefined)
          }}
          onSubmit={save}
        />
      )}

      <DeleteProductDialog
        product={removing}
        deleting={deleteMutation.isPending}
        blocked={deleteMutation.error?.status === RESTRICTED_STATUS}
        onConfirm={confirmRemove}
        onClose={() => setRemoving(undefined)}
      />

      {/* El 412 no es un error a mostrar acá: lo explica el propio modal. La
          condición mira `isConflict` y no `conflict`, que es `undefined`
          también mientras se resuelve el refetch. */}
      {updateMutation.isError && !isConflict ? (
        <Typography variant="body2" role="alert" sx={{ color: 'error.main', mt: 2 }}>
          {updateMutation.error.message}
        </Typography>
      ) : null}

      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        message={notice ?? undefined}
      />
    </PageWrapper>
  )
}
