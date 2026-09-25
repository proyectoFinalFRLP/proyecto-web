import { Box, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'

// Botón − · cantidad · botón +, en una sola fila que no se parte.
export const StepperRoot = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}))

// Ancho justo para tres cifras: la columna es «Cantidad», no un campo libre.
// Sin las flechas nativas del `number`: los botones − y + ya hacen ese trabajo.
export const StepperInput = styled(TextField)({
  width: 72,
  '& input': {
    textAlign: 'center',
    MozAppearance: 'textfield',
  },
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
})

// El aviso de stock bajo la tabla, como en S09: ícono y texto en el color de
// advertencia, dentro de la misma tarjeta.
export const StockWarnings = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  color: theme.vars.palette.warning.main,
  '& > div': { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },
  '& svg': { fontSize: 18 },
}))
