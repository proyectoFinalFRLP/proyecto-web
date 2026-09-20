import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Buscador · cantidad · precio · botón, en una línea; se envuelve en pantallas
// angostas para que ningún campo quede cortado.
export const PickerForm = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  maxWidth: '100%',
}))

// El buscador se queda con el ancho que sobra, con un piso para que SKU y
// nombre se lean; cuando ni eso entra, baja a su propia línea.
export const SearchSlot = styled(Box)({
  flex: '1 1 240px',
  minWidth: 0,
  maxWidth: 360,
})

export const QuantitySlot = styled(Box)({
  width: 104,
})

export const PriceSlot = styled(Box)({
  width: 160,
})

// Dos líneas por opción: el SKU con el nombre, y debajo categoría y stock.
export const OptionBody = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})
