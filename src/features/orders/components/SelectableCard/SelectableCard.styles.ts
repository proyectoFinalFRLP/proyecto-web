import { ButtonBase } from '@mui/material'
import { styled } from '@mui/material/styles'

// Radio de la tarjeta (px): `radius.md` del DS. No se lee de `tokens.ts` porque
// una feature no puede importar de `app/` (architecture.md §3.2); mismo
// criterio que `EditProductModal.styles.ts`.
const CARD_RADIUS = 12

interface SelectableCardProps {
  selected: boolean
}

const TRANSIENT_PROPS = new Set<string>(['selected'])

/**
 * Una opción elegible con forma de tarjeta: el depósito de origen del paso 2
 * (S06) y el operador logístico del paso 3 (S07). Se extrajo cuando apareció el
 * segundo consumidor (`feature-structure.md` §6).
 *
 * La elegida se resalta con el contenedor y el borde del color de acción, en los
 * dos modos: la opción elegida se tiene que distinguir claramente, y el color no
 * va solo — cada consumidor la acompaña con un ícono de check. El rol de radio y
 * `aria-checked` los pone el consumidor, que es el que arma el grupo.
 */
export const SelectableCard = styled(ButtonBase, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<SelectableCardProps>(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  textAlign: 'left',
  borderRadius: CARD_RADIUS,
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
