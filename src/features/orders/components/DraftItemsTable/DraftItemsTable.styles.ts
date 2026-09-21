import { TextField } from '@mui/material'
import { styled } from '@mui/material/styles'

// Ancho justo para tres cifras y las flechas del `number`: la columna es
// «Cantidad», no un campo de texto libre.
export const QuantityInput = styled(TextField)({
  width: 88,
  '& input': { textAlign: 'right' },
})
