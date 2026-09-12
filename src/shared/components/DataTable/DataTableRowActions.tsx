import MoreVertIcon from '@mui/icons-material/MoreVert'
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useId, useState } from 'react'

import type { DataTableAction, DataTableRowActionsProps } from './DataTable.types'

const MENU_WIDTH = 176

/**
 * Kebab de acciones de una fila.
 *
 * Sobre `Menu` de MUI: cerrar al hacer clic afuera, al apretar Escape y
 * devolver el foco al botón son comportamientos que ya trae resueltos, y son
 * justo los que pide el criterio de la card.
 *
 * Cada fila monta su propio menú y su propio estado. Es más simple que un menú
 * único compartido, y con el volumen de filas de una página no se nota.
 */
export function DataTableRowActions<Row>({ row, actions, label }: DataTableRowActionsProps<Row>) {
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = anchorEl !== null

  function handleSelect(action: DataTableAction<Row>) {
    // Se cierra primero: la acción puede desmontar la fila (ej. Eliminar) y el
    // menú quedaría anclado a un nodo que ya no existe.
    setAnchorEl(null)
    action.onSelect(row)
  }

  return (
    <>
      <IconButton
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: MENU_WIDTH } } }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => handleSelect(action)}
            sx={action.tone === 'danger' ? { color: 'error.main' } : undefined}
          >
            {action.icon === undefined ? null : (
              // El ícono hereda el color del ítem, así "Eliminar" queda entero
              // en rojo y no sólo su texto.
              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>{action.icon}</ListItemIcon>
            )}
            <ListItemText primaryTypographyProps={{ variant: 'bodyMd' }}>
              {action.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
