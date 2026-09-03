import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { CreateProductModal } from '../components/CreateProductModal'
import { EditProductModal } from '../components/EditProductModal'
import { inventoryCopy } from '../content'
import {
  CONFLICT_STATUS,
  useCreateProduct,
  useProduct,
  useProductList,
  useUpdateProduct,
  useWarehouses,
} from '../hooks/useInventory'
import type { Product, UpdateProductPayload } from '../types'
import { describeConflict } from '../utils/conflict'

const { page, createModal } = inventoryCopy

/**
 * Listado del catálogo y punto de entrada a los modales de alta y edición.
 *
 * El listado es deliberadamente plano — nombre, SKU y stock total: **TESIS-62
 * (Master Catalog) lo reemplaza** por el Data Grid con columnas, filtros y
 * paginación. Lo que sí es definitivo es el cableado: los datos salen de la API
 * real y las mutaciones impactan contra `/api/v1/products`.
 */
export function InventoryPage() {
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  // Estado del producto cuando el modal lo abrió. Se guarda para poder decir
  // QUÉ cambió si la API rechaza el guardado por versión vieja (TESIS-101).
  const [baseline, setBaseline] = useState<Product | undefined>(undefined)
  // Último cuerpo enviado, para poder reintentarlo tal cual al pisar.
  const [lastPayload, setLastPayload] = useState<UpdateProductPayload | undefined>(undefined)

  const products = useProductList()
  const warehouses = useWarehouses()
  const product = useProduct(editingId)
  const updateMutation = useUpdateProduct(editingId, product.data?.version ?? null)
  const createMutation = useCreateProduct()

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
    setLastPayload(payload)
    if (product.data !== undefined) setBaseline(product.data)
    const name = product.data?.name ?? ''
    updateMutation.mutate(payload, {
      onSuccess: () => {
        setSavedName(name)
        setEditingId(undefined)
        setBaseline(undefined)
      },
      onError: () => void product.refetch(),
    })
  }

  if (products.isPending || warehouses.isPending) return <LoadingSpinner fullScreen />

  if (products.isError || warehouses.isError) {
    return (
      <ErrorFallback
        error={products.error ?? warehouses.error ?? undefined}
        onRetry={() => {
          void products.refetch()
          void warehouses.refetch()
        }}
      />
    )
  }

  function openCreate() {
    // El error anterior no debe reaparecer sobre el SKU de un alta nueva.
    createMutation.reset()
    setCreating(true)
  }

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
            <Typography variant="h1" component="h1">
              {page.title}
            </Typography>
            <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
              {page.subtitle}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {createModal.open}
          </Button>
        </Box>

        {products.data.length === 0 ? (
          <Typography variant="bodyMd" sx={{ color: 'text.secondary' }}>
            {page.empty}
          </Typography>
        ) : (
          <List disablePadding>
            {products.data.map((item) => (
              <ListItemButton key={item.id} onClick={() => setEditingId(item.id)}>
                <ListItemText
                  primary={item.name}
                  secondary={`${item.sku} · ${page.stockSummary(item.totalStock)}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}

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
                setSavedName(created.name)
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
            onOverwrite={lastPayload === undefined ? undefined : () => save(lastPayload)}
            onClose={() => {
              // Sin el reset, el error de la mutación sobrevive al modal y queda
              // colgado en la página — un 412 que ya no aplica a nada visible.
              updateMutation.reset()
              setEditingId(undefined)
              setBaseline(undefined)
              setLastPayload(undefined)
            }}
            onSubmit={save}
          />
        )}

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

        <Snackbar
          open={savedName !== null}
          autoHideDuration={4000}
          onClose={() => setSavedName(null)}
          message={savedName === null ? undefined : page.saved(savedName)}
        />
      </Stack>
    </PageWrapper>
  )
}
