import { Box, Table, TableCell } from '@mui/material'
import { styled } from '@mui/material/styles'

// El remito es papel: negro sobre blanco, sin el tema de la pantalla (que puede
// estar en oscuro). Los colores salen de `common`, no de la paleta semántica.
export const NoteRoot = styled(Box)(({ theme }) => ({
  // En pantalla no se ve: existe sólo para la impresión (ver las reglas
  // globales en DeliveryNote.tsx).
  display: 'none',
  color: theme.palette.common.black,
  backgroundColor: theme.palette.common.white,
  fontFamily: theme.typography.fontFamily,
  fontSize: 12,
  lineHeight: 1.5,
  padding: theme.spacing(2),
}))

export const NoteHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `2px solid ${theme.palette.common.black}`,
}))

export const NoteSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.grey[400]}`,
}))

export const NoteTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  '& th, & td': { color: theme.palette.common.black, fontSize: 12 },
}))

export const HeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  borderBottom: `1px solid ${theme.palette.common.black}`,
}))

export const SignatureRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(3),
  marginTop: theme.spacing(6),
  '& > div': {
    borderTop: `1px solid ${theme.palette.common.black}`,
    paddingTop: theme.spacing(0.5),
    textAlign: 'center',
  },
}))
