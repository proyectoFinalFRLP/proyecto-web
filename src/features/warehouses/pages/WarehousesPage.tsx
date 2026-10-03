import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { DataTable, ErrorFallback, LoadingSpinner, PageWrapper } from 'shared/components'
import type { DataTableAction, DataTableColumn } from 'shared/components'
import { notify } from 'shared/store'

import { DeleteWarehouseDialog } from '../components/DeleteWarehouseDialog'
import { WarehouseFormModal } from '../components/WarehouseFormModal'
import { formatUnits, warehousesCopy } from '../content'
import {
  RESTRICTED_STATUS,
  useCreateWarehouse,
  useDeleteWarehouse,
  useUpdateWarehouse,
  useWarehouseList,
} from '../hooks/useWarehouses'
import type { Warehouse, WarehouseInput } from '../types'
import { deleteBlockerFrom } from '../utils/deleteBlocker'

const { page, columns, actions: actionCopy, form } = warehousesCopy

const COLUMNS: DataTableColumn<Warehouse>[] = [
  { id: 'name', header: columns.name, render: (warehouse) => warehouse.name },
  { id: 'address', header: columns.address, render: (warehouse) => warehouse.address },
  {
    id: 'zipCode',
    header: columns.zipCode,
    width: 140,
    render: (warehouse) => warehouse.zipCode,
  },
  {
    id: 'storedUnits',
    header: columns.storedUnits,
    align: 'right',
    width: 180,
    render: (warehouse) => formatUnits(warehouse.storedUnits),
  },
]

/** El modal abierto: alta, edición de un depósito, o ninguno. */
type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; warehouse: Warehouse }

/**
 * Depósitos de la empresa (RF-03): listado, alta, edición y baja contra
 * `/api/v1/warehouses`.
 *
 * No tiene maqueta en `docs/design/`: se arma con la tabla, el modal y el
 * diálogo de confirmación del DS, con la cabecera de las demás pantallas.
 */
export function WarehousesPage() {
  const warehouses = useWarehouseList()
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()
  const deleteMutation = useDeleteWarehouse()
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' })
  const [removing, setRemoving] = useState<Warehouse | undefined>(undefined)

  const activeMutation = formState.mode === 'edit' ? updateMutation : createMutation

  function openForm(next: FormState) {
    createMutation.reset()
    updateMutation.reset()
    setFormState(next)
  }

  function save(input: WarehouseInput) {
    const done = (saved: Warehouse) => {
      notify(
        formState.mode === 'edit' ? page.saved(saved.name) : page.created(saved.name),
        'success',
      )
      setFormState({ mode: 'closed' })
    }

    if (formState.mode === 'edit') {
      updateMutation.mutate({ id: formState.warehouse.id, input }, { onSuccess: done })
    } else {
      createMutation.mutate(input, { onSuccess: done })
    }
  }

  function askToRemove(warehouse: Warehouse) {
    deleteMutation.reset()
    setRemoving(warehouse)
  }

  function confirmRemove() {
    if (removing === undefined) return

    const { name } = removing
    deleteMutation.mutate(removing.id, {
      onSuccess: () => {
        notify(page.deleted(name), 'success')
        setRemoving(undefined)
      },
    })
  }

  const blocked = deleteMutation.error?.status === RESTRICTED_STATUS

  const rowActions: DataTableAction<Warehouse>[] = [
    {
      id: 'edit',
      label: actionCopy.edit,
      icon: <EditOutlinedIcon fontSize="small" />,
      onSelect: (warehouse) => openForm({ mode: 'edit', warehouse }),
    },
    {
      id: 'delete',
      label: actionCopy.delete,
      icon: <DeleteOutlineIcon fontSize="small" />,
      tone: 'danger',
      onSelect: askToRemove,
    },
  ]

  if (warehouses.isPending) return <LoadingSpinner fullScreen />

  if (warehouses.isError) {
    return <ErrorFallback error={warehouses.error} onRetry={() => void warehouses.refetch()} />
  }

  return (
    <PageWrapper>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        useFlexGap
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openForm({ mode: 'create' })}
          sx={{ ml: { md: 'auto' }, flexShrink: 0 }}
        >
          {page.create}
        </Button>
      </Stack>

      <DataTable
        columns={COLUMNS}
        rows={warehouses.data}
        getRowId={(warehouse) => warehouse.id}
        label={page.tableLabel}
        actions={rowActions}
        actionsHeader={actionCopy.header}
        getActionsLabel={(warehouse) => actionCopy.menuFor(warehouse.name)}
        emptyMessage={page.empty}
        footer={page.footer(warehouses.data.length)}
      />

      <WarehouseFormModal
        open={formState.mode !== 'closed'}
        warehouse={formState.mode === 'edit' ? formState.warehouse : undefined}
        submitting={activeMutation.isPending}
        // El mensaje de la API viene en inglés: se muestra uno propio.
        error={activeMutation.isError ? form.failed : undefined}
        onSubmit={save}
        onClose={() => setFormState({ mode: 'closed' })}
      />

      <DeleteWarehouseDialog
        warehouse={removing}
        deleting={deleteMutation.isPending}
        blocker={blocked ? deleteBlockerFrom(deleteMutation.error?.message) : undefined}
        failed={deleteMutation.isError ? !blocked : false}
        onConfirm={confirmRemove}
        onClose={() => setRemoving(undefined)}
      />
    </PageWrapper>
  )
}
