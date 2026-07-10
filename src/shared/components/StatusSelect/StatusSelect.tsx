import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Menu } from '@mui/material'
import { useId, useState } from 'react'

import { StatusBadge } from '../StatusBadge'

import { ItemLabel, StatusDot, StatusMenuItem, menuPaperSx } from './StatusSelect.styles'
import type { StatusSelectProps } from './StatusSelect.types'

// Badge de estado clickeable que abre un menú para cambiarlo (patrón de OMS).
// La navegación por teclado (↑/↓, Enter, ESC, Home/End, typeahead) y el retorno
// de foco al trigger los resuelve MUI Menu.
export function StatusSelect({ options, value, onChange, size = 'md' }: StatusSelectProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const menuId = useId()
  const current = options.find((o) => o.status === value) ?? options[0]

  const close = () => setAnchorEl(null)

  return (
    <>
      <StatusBadge
        status={current.status}
        label={current.label}
        size={size}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      />
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        {options.map((o) => {
          const selected = o.status === value
          return (
            <StatusMenuItem
              key={o.status}
              selected={selected}
              onClick={() => {
                onChange(o.status)
                close()
              }}
            >
              <StatusDot statusColor={o.status} />
              <ItemLabel>{o.label}</ItemLabel>
              {selected ? <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} /> : null}
            </StatusMenuItem>
          )
        })}
      </Menu>
    </>
  )
}
