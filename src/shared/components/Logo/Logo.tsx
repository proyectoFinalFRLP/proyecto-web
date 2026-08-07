import { Typography } from '@mui/material'

import { CropMark, LogoRoot, MarkBox, TaglineRow, TaglineRule, Wordmark } from './Logo.styles'
import type { LogoProps } from './Logo.types'
import { LogoMark } from './LogoMark'

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const

/**
 * Lockup de la marca: isotipo + "PRECISION" con "LOGISTICS" de bajada.
 *
 * Las dos reglas del manual viajan con el componente y no con quien lo usa: el
 * área de respeto va como padding propio y el mínimo de 140px como `minWidth`.
 * Así no se puede meter el logo en un hueco donde deje de ser legible.
 */
export function Logo({ brand, tagline }: LogoProps) {
  return (
    <LogoRoot role="img" aria-label={`${brand} ${tagline}`}>
      <MarkBox>
        <LogoMark />
        {CORNERS.map((corner) => (
          <CropMark key={corner} corner={corner} aria-hidden />
        ))}
      </MarkBox>

      <Wordmark>
        <Typography
          variant="displaySm"
          color="primary.main"
          sx={{ fontWeight: 800, letterSpacing: '-0.05em', textTransform: 'uppercase' }}
        >
          {brand}
        </Typography>
        <TaglineRow>
          <TaglineRule aria-hidden />
          <Typography
            variant="bodyMd"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            {tagline}
          </Typography>
        </TaglineRow>
      </Wordmark>
    </LogoRoot>
  )
}
