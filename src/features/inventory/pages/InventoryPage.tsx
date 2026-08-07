import { List, ListItemButton, ListItemText, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { EditProductModal } from '../components/EditProductModal'
import { inventoryCopy } from '../content'
import { useProduct, useProductList, useUpdateProduct, useWarehouses } from '../hooks/useInventory'

const { page } = inventoryCopy

/**
 * Listado del catálogo y punto de entrada al modal de edición.
 *
 * El listado es deliberadamente plano — nombre, SKU y stock total: **TESIS-62
 * (Master Catalog) lo reemplaza** por el Data Grid con columnas, filtros y
 * paginación. Lo que sí es definitivo es el cableado: los datos salen de la API
 * real y el guardado impacta contra `PUT /api/v1/products/:id`.
 */
export function InventoryPage() {
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [savedName, setSavedName] = useState<string | null>(null)

  const products = useProductList()
  const warehouses = useWarehouses()
  const product = useProduct(editingId)
  const updateMutation = useUpdateProduct(editingId)

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

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <div>
          <Typography variant="h1" component="h1">
            {page.title}
          </Typography>
          <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
            {page.subtitle}
          </Typography>
        </div>

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

        {/* El detalle trae los `stocks`, que el listado no incluye: hasta que
            resuelve no hay con qué poblar el formulario. */}
        {product.data === undefined ? null : (
          <EditProductModal
            open={editingId !== undefined}
            product={product.data}
            warehouses={warehouses.data}
            submitting={updateMutation.isPending}
            onClose={() => setEditingId(undefined)}
            onSubmit={(payload) => {
              const name = product.data.name
              updateMutation.mutate(payload, {
                onSuccess: () => {
                  setSavedName(name)
                  setEditingId(undefined)
                },
              })
            }}
          />
        )}

        {updateMutation.isError ? (
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
