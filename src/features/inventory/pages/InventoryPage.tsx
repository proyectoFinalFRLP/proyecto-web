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
import { Link } from 'react-router-dom'
import { ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'

import { CreateProductModal } from '../components/CreateProductModal'
import { inventoryCopy } from '../content'
import { useCreateProduct, useProductList, useWarehouses } from '../hooks/useInventory'

const { page, createModal } = inventoryCopy

/**
 * Listado del catálogo, alta de producto y entrada al detalle de cada SKU.
 *
 * El listado es deliberadamente plano — nombre, SKU y stock total: **TESIS-62
 * (Master Catalog) lo reemplaza** por el Data Grid con columnas, filtros y
 * paginación. Lo que sí es definitivo es el cableado: los datos salen de la API
 * real y las mutaciones impactan contra `/api/v1/products`.
 *
 * La edición ya no vive acá: como en el diseño (S10 → S12), tocar una fila abre
 * el detalle del producto, que es donde está el botón "Editar producto".
 */
export function InventoryPage() {
  const [creating, setCreating] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)

  const products = useProductList()
  const warehouses = useWarehouses()
  const createMutation = useCreateProduct()

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
              <ListItemButton key={item.id} component={Link} to={`/inventory/${item.id}`}>
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
