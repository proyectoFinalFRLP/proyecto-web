import { Alert } from '@mui/material'
import { styled } from '@mui/material/styles'

// Ancho del aviso del diseño (Alert.dc.html): suficiente para una oración sin
// que el toast cruce la pantalla de lado a lado en escritorio.
const TOAST_MAX_WIDTH = 520

// El toast es el aviso del sistema del tema, flotando. Dos ajustes para que
// flote: en dark el fondo tonal es translúcido (la intención al 12%) y dejaría
// ver la pantalla de atrás, así que el tinte se pinta encima del `paper` opaco;
// y lleva la sombra del nivel 2, la de lo que se despliega por encima del resto.
export const Toast = styled(Alert)(({ theme, severity = 'info' }) => {
  const tint = theme.palette[severity].container

  return {
    width: '100%',
    maxWidth: TOAST_MAX_WIDTH,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: `linear-gradient(${tint}, ${tint})`,
    boxShadow: theme.elevation[2].boxShadow,
  }
})
