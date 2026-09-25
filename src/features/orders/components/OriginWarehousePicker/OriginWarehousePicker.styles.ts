import { Box, ButtonBase } from '@mui/material'
import { styled } from '@mui/material/styles'

// Radio de la tarjeta (px): `radius.md` del DS. No se lee de `tokens.ts` porque
// una feature no puede importar de `app/` (architecture.md §3.2); mismo
// criterio que `EditProductModal.styles.ts`.
const OPTION_RADIUS = 12

// Tres columnas en el diseño; dos o una cuando no entran.
export const OptionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
}))

interface OptionProps {
  selected: boolean
}

const TRANSIENT_PROPS = new Set<string>(['selected'])

// La tarjeta de depósito de S06. La elegida se resalta con el contenedor y el
// borde del color de acción, en los dos modos: la card pide que la opción
// elegida se distinga claramente, y el color no va solo — el ícono de check
// acompaña.
export const Option = styled(ButtonBase, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<OptionProps>(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  textAlign: 'left',
  borderRadius: OPTION_RADIUS,
  border: `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
  backgroundColor: selected
    ? theme.vars.palette.primary.container
    : theme.vars.palette.background.default,
  transition: theme.transitions.create(['border-color', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover:not(.Mui-disabled)': { borderColor: theme.vars.palette.primary.main },
  '&.Mui-disabled': { opacity: 0.6 },
}))

export const OptionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  '& > svg': { marginLeft: 'auto', fontSize: 20, flexShrink: 0 },
}))

export const OptionTitle = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

// El motivo por el que un depósito no se puede elegir, sólo para el lector de
// pantalla: a la vista ya lo dice el badge.
export const ScreenReaderOnly = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
})
