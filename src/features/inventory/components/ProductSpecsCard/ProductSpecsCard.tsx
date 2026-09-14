import { Divider, Typography } from '@mui/material'

import { inventoryCopy } from '../../content'

import {
  CardHeading,
  SecondaryRow,
  SpecItem,
  SpecLabel,
  SpecValue,
  SpecsCard,
  SpecsGrid,
} from './ProductSpecsCard.styles'
import type { ProductSpec, ProductSpecsCardProps } from './ProductSpecsCard.types'

const specsCopy = inventoryCopy.detail.specs

// Celda de la cuadrícula. Stateless y usada sólo acá: no justifica archivo
// propio (`react/no-multi-comp` exceptúa los stateless).
function SpecCell({ label, value, mono = false, unknown = false }: ProductSpec) {
  return (
    <SpecItem>
      <SpecLabel variant="labelSm">{label}</SpecLabel>
      <SpecValue variant="bodyLg" mono={mono} unknown={unknown}>
        {value}
      </SpecValue>
    </SpecItem>
  )
}

/** Tarjeta "Especificaciones" de S12: datos técnicos y categoría del producto. */
export function ProductSpecsCard({ specs, secondarySpecs, footnote }: ProductSpecsCardProps) {
  return (
    <SpecsCard>
      <CardHeading>
        <Typography variant="h3" component="h2">
          {specsCopy.title}
        </Typography>
        <Typography variant="bodyMd" color="text.secondary">
          {specsCopy.subtitle}
        </Typography>
      </CardHeading>

      <SpecsGrid>
        {specs.map((spec) => (
          <SpecCell key={spec.id} {...spec} />
        ))}
      </SpecsGrid>

      <Divider />

      <SecondaryRow>
        {secondarySpecs.map((spec) => (
          <SpecCell key={spec.id} {...spec} />
        ))}
      </SecondaryRow>

      {footnote === undefined ? null : (
        <Typography variant="labelSm" color="text.secondary">
          {footnote}
        </Typography>
      )}
    </SpecsCard>
  )
}
