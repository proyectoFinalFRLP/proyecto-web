import {
  BrandName,
  CropMark,
  LogoRoot,
  MarkBox,
  TaglineRow,
  TaglineRule,
  TaglineText,
  Wordmark,
} from './Logo.styles'
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
        <BrandName variant="displaySm" color="primary.main">
          {brand}
        </BrandName>
        <TaglineRow>
          <TaglineRule aria-hidden />
          <TaglineText variant="bodyMd" color="text.secondary">
            {tagline}
          </TaglineText>
        </TaglineRow>
      </Wordmark>
    </LogoRoot>
  )
}
