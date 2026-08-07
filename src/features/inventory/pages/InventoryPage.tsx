import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { PageWrapper } from 'shared/components'

import { EditProductModal } from '../components/EditProductModal'
import { inventoryCopy } from '../content'
import { sampleProduct, sampleWarehouses } from '../sampleData'
import type { UpdateProductPayload } from '../types'

const { page, modal } = inventoryCopy

/**
 * Anfitrión provisorio del modal de edición.
 *
 * TESIS-67 sólo construye el modal. Esta página existe para poder abrirlo y
 * revisarlo mientras tanto: **TESIS-62 (Master Catalog) reemplaza su cuerpo** por
 * la tabla real y conecta el submit con la mutación. Cuando eso pase, lo único
 * que sobrevive de este archivo es la ruta.
 */
export function InventoryPage() {
  const [open, setOpen] = useState(false)
  const [lastPayload, setLastPayload] = useState<UpdateProductPayload | null>(null)

  return (
    <PageWrapper>
      <Stack spacing={3} alignItems="flex-start">
        <div>
          <Typography variant="h1" component="h1">
            {page.title}
          </Typography>
          <Typography variant="bodyLg" sx={{ color: 'text.secondary' }}>
            {page.subtitle}
          </Typography>
        </div>

        <Button variant="contained" onClick={() => setOpen(true)}>
          {modal.title(sampleProduct.name)}
        </Button>

        {lastPayload === null ? null : (
          <Typography
            variant="dataMono"
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}
          >
            {JSON.stringify(lastPayload, null, 2)}
          </Typography>
        )}

        <EditProductModal
          open={open}
          product={sampleProduct}
          warehouses={sampleWarehouses}
          onClose={() => setOpen(false)}
          onSubmit={(payload) => {
            // Sin backend conectado, el resultado se muestra en pantalla: sirve
            // para verificar el cuerpo que se le va a mandar a la API.
            setLastPayload(payload)
            setOpen(false)
          }}
        />
      </Stack>
    </PageWrapper>
  )
}
