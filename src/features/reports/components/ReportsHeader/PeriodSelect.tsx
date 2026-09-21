import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Menu, MenuItem } from '@mui/material'
import { useId, useState } from 'react'

import { reportsCopy } from '../../content'
import type { ReportPeriod } from '../../types'

import type { PeriodSelectProps } from './ReportsHeader.types'

const { period: copy } = reportsCopy

// Las ventanas que ofrece el selector, en el orden del menú.
const PERIODS: ReportPeriod[] = ['7d', '30d', '90d']

/**
 * El «Últimos 30 días» de S14: un botón de contorno que abre el menú de
 * períodos. Sobre `Menu` de MUI por lo mismo que el kebab de la tabla: cerrar
 * al hacer clic afuera, con Escape y devolver el foco ya vienen resueltos.
 */
export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = anchorEl !== null

  function select(period: ReportPeriod) {
    setAnchorEl(null)
    if (period !== value) onChange(period)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonthOutlinedIcon />}
        endIcon={<ExpandMoreIcon />}
        // Qué es y qué vale, en el mismo nombre: sólo el texto visible dejaría
        // al lector con «Últimos 30 días» sin saber que es un selector.
        aria-label={`${copy.label}: ${copy.options[value]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {copy.options[value]}
      </Button>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {PERIODS.map((period) => (
          <MenuItem key={period} selected={period === value} onClick={() => select(period)}>
            {copy.options[period]}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
