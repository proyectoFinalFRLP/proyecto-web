import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

// El atributo con el que la hoja de impresión reconoce al remito entre los
// hijos del `<body>`: todo lo demás se esconde mientras se imprime. El
// componente lo pone con este mismo nombre (`data-delivery-note`).
const PRINT_ROOT_ATTRIBUTE = 'data-delivery-note'

// Los estilos globales de la impresión, para `GlobalStyles`. Viven mientras el
// remito está montado: un Ctrl+P en cualquier otro momento imprime la pantalla
// como siempre.
export function printOnlyStyles() {
  return {
    '@media print': {
      [`body > :not([${PRINT_ROOT_ATTRIBUTE}])`]: { display: 'none !important' },
      '@page': { margin: '16mm' },
    },
  }
}

// El papel es blanco en los dos modos: en oscuro, el texto claro del tema
// saldría invisible. Por eso los colores son los comunes del tema y no los
// del esquema activo.
const ink = (theme: Theme) => theme.vars.palette.common.black
const paper = (theme: Theme) => theme.vars.palette.common.white

// En pantalla no se ve nunca: existe sólo para la hoja impresa.
export const NoteRoot = styled(Box)(({ theme }) => ({
  display: 'none',
  '@media print': {
    display: 'block',
    color: ink(theme),
    backgroundColor: paper(theme),
    fontFamily: theme.typography.fontFamily,
  },
}))

export const NoteHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `2px solid ${ink(theme)}`,
}))

export const NoteMeta = styled(Box)({
  textAlign: 'right',
})

export const NoteSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}))

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.labelCaps,
  margin: 0,
  marginBottom: theme.spacing(1),
}))

export const LinesTable = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  ...theme.typography.bodyMd,
  '& th, & td': {
    padding: theme.spacing(0.75, 1),
    borderBottom: `1px solid ${ink(theme)}`,
    textAlign: 'left',
  },
  '& th': { ...theme.typography.labelCaps },
  // La cantidad se lee alineada a la derecha, como cualquier número de una tabla.
  '& th:last-of-type, & td:last-of-type': { textAlign: 'right' },
  '& tfoot td': { fontWeight: 700, borderBottom: 'none' },
}))

export const Mono = styled('span')(({ theme }) => ({
  fontFamily: theme.typography.dataMono.fontFamily,
}))

// La conformidad del que recibe: lo que hace del papel un remito y no un listado.
export const Signatures = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(6),
  '& > *': {
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${ink(theme)}`,
  },
}))
