import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Geometría del feed (px). Alta densidad: la barra es fina y el interlineado
// corto, para que quepan muchos logs sin que se vuelvan ilegibles.
const BAR_WIDTH = 4
const BAR_HEIGHT = 40
const ENTRY_GAP = 12
const MUTED_OPACITY = 0.6

const TRANSIENT_PROPS = new Set<string>(['current'])

const notForwarded = (prop: string | number | symbol) => !TRANSIENT_PROPS.has(prop as string)

export const FeedRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
}))

export const EntryList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export const Entry = styled(Box, { shouldForwardProp: notForwarded })<{ current: boolean }>(
  ({ current }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: ENTRY_GAP,
    // Las entradas viejas se atenúan enteras en vez de cambiarles el color al
    // texto: mantiene la jerarquía sin inventar un segundo tono de gris.
    opacity: current ? 1 : MUTED_OPACITY,
  }),
)

// La barra a la izquierda es el indicador de la línea de tiempo. En acento
// cuando la entrada está vigente, en superficie elevada cuando ya pasó.
export const EntryBar = styled(Box, { shouldForwardProp: notForwarded })<{ current: boolean }>(
  ({ theme, current }) => ({
    flexShrink: 0,
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 9999,
    backgroundColor: current
      ? theme.palette.secondary.main
      : theme.palette.background.containerHighest,
  }),
)

export const EntryBody = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
})
