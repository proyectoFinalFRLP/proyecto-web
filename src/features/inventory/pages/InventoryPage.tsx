import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableTab } from 'shared/components'
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue'

import { CreateProductModal } from '../components/CreateProductModal'
import { DeleteProductDialog } from '../components/DeleteProductDialog'
import { InventoryTable } from '../components/InventoryTable'
import { formatUnits, inventoryCopy } from '../content'
import {
  CATALOG_TABS,
  RESTRICTED_STATUS,
  useCreateProduct,
  useDeleteProduct,
  useProductCounts,
  useProductPage,
  useWarehouses,
} from '../hooks/useInventory'
import type { CatalogTabId } from '../hooks/useInventory'
import type { ProductSummary } from '../types'

const { page, createModal, tabs: tabCopy, pagination } = inventoryCopy

const PER_PAGE = 20

// La pestaña vive en la query string y no sólo en el estado del componente: el
// panel de operación enlaza acá con `?tab=low` desde su tarjeta de alertas
// (TESIS-55), y un estado local no se podría enlazar ni compartir.
const TAB_PARAM = 'tab'

/** La pestaña que pide la URL, o `all` si no pide ninguna válida. */
function tabFromParams(params: URLSearchParams): CatalogTabId {
  const requested = params.get(TAB_PARAM)

  return CATALOG_TABS.some((tab) => tab.id === requested) ? (requested as CatalogTabId) : 'all'
}

/** El copy de cada pestaña, por su id. El orden vive en `CATALOG_TABS`. */
const TAB_LABELS: Record<CatalogTabId, string> = {
  all: tabCopy.all,
  available: tabCopy.available,
  low: tabCopy.low,
  out_of_stock: tabCopy.out_of_stock,
}

/**
 * Catálogo maestro: pestañas por disponibilidad, búsqueda y paginación contra
 * `GET /api/v1/products`, más el alta y la baja de un producto.
 *
 * La edición no vive acá. El menú de acciones de cada fila lleva al detalle del
 * producto, que es donde está el formulario (S10 → S12 → S13 en el diseño). La
 * card lo pide así: «la opción Editar redirige a la ruta de edición».
 *
 * El estado de stock de cada fila lo decide el backend y no esta pantalla: el
 * umbral vive en el modelo, así que la pestaña y el badge no pueden discrepar.
 */
export function InventoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabId = tabFromParams(searchParams)
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<ProductSummary | undefined>(undefined)
  const [notice, setNotice] = useState<string | null>(null)

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
  const createMutation = useCreateProduct()
  const deleteMutation = useDeleteProduct()

  // Cambiar de pestaña o de búsqueda vuelve a la primera página: quedarse en la
  // 7 de un filtro que ahora tiene 2 deja la tabla vacía sin motivo visible.
  function changeTab(nextTabId: string) {
    // `replace`: moverse entre pestañas no es navegación que merezca una
    // entrada en el historial, y con `push` el botón Atrás recorrería una por
    // una todas las que el usuario haya mirado antes de volver al panel.
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (nextTabId === 'all') next.delete(TAB_PARAM)
        else next.set(TAB_PARAM, nextTabId)
        return next
      },
      { replace: true },
    )
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
    // Si se va la última fila de la página, esa página deja de existir: el
    // listado volvería vacío y el pie diciendo "Mostrando 81 a 80".
    const eraLaUltimaDeLaPagina = (products.data?.products.length ?? 0) === 1

    deleteMutation.mutate(removing.id, {
      onSuccess: () => {
        setNotice(page.deleted(name))
        setRemoving(undefined)
        if (eraLaUltimaDeLaPagina) setPageNumber((current) => Math.max(current - 1, 1))
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
          <Typography variant="h1" component="h1">
            {page.title}
          </Typography>
          <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
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
        // Editar lleva al mismo detalle, pero pidiéndole que abra el formulario
        // al llegar: sin esa señal las dos acciones harían exactamente lo mismo.
        onEdit={(target) => void navigate(`/inventory/${target.id}`, { state: { edit: true } })}
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

      <DeleteProductDialog
        product={removing}
        deleting={deleteMutation.isPending}
        blocked={deleteMutation.error?.status === RESTRICTED_STATUS}
        onConfirm={confirmRemove}
        onClose={() => setRemoving(undefined)}
      />

      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        message={notice ?? undefined}
      />
    </PageWrapper>
  )
}
