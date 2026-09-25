import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Una opción por fila, como en S07: se comparan de arriba a abajo por precio.
export const OptionsColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const OptionRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: { flexWrap: 'wrap' },
}))

// El recuadro del logo del diseño. No hay logos de los operadores en el
// proyecto, así que lleva el nombre en mayúsculas, que es lo que dibuja S07.
// Repite el nombre que va al lado, así que es lo primero que cede cuando la
// columna se angosta (con el resumen al costado, por debajo de `lg`).
export const CarrierMark = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('lg')]: { display: 'none' },
  width: 88,
  height: 48,
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 1),
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  textAlign: 'center',
}))

export const CarrierText = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 0,
  flex: '1 1 auto',
}))

export const PriceColumn = styled(Box)({
  marginLeft: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
})

// El precio de S07: grande y en la familia de los datos, como los totales del
// paso 1 (`DraftSummaryCard`). Un `span` y no un `Typography`: vive dentro del
// `<button>` de la tarjeta, que sólo admite contenido en línea.
export const Price = styled('span')(({ theme }) => ({
  ...theme.typography.h2,
  fontFamily: theme.typography.dataMono.fontFamily,
  fontWeight: 700,
  whiteSpace: 'nowrap',
}))
