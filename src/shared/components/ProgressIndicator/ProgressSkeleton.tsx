import { Skeleton, Typography } from '@mui/material'

import { Root, SkeletonLines, SkeletonRow } from './ProgressIndicator.styles'
import type { ProgressSkeletonProps } from './ProgressIndicator.types'

const AVATAR_SIZE = 40
const LINE_HEIGHT = 8
// La primera línea más corta insinúa un título; las siguientes, cuerpo.
const FIRST_LINE_WIDTH = '55%'

/**
 * Placeholder de carga con la misma silueta que el contenido que reemplaza.
 * Evita el salto de layout entre el estado de carga y los datos ya resueltos.
 */
export function ProgressSkeleton({ label, avatar = true, lines = 2 }: ProgressSkeletonProps) {
  const rows = Math.max(1, Math.trunc(lines))

  return (
    <Root aria-busy="true" aria-live="polite">
      {/* Mismo tratamiento que el `label` de ProgressIndicator y StepsProgress:
          la prop tiene que verse igual en los tres. */}
      {label ? <Typography variant="labelMd">{label}</Typography> : null}
      <SkeletonRow>
        {avatar ? <Skeleton variant="circular" width={AVATAR_SIZE} height={AVATAR_SIZE} /> : null}
        <SkeletonLines>
          {Array.from({ length: rows }, (_unused, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={LINE_HEIGHT}
              width={index === 0 ? FIRST_LINE_WIDTH : '100%'}
            />
          ))}
        </SkeletonLines>
      </SkeletonRow>
    </Root>
  )
}
