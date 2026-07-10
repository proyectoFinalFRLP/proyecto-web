import { lazy } from 'react'

export const HomePageLazy = lazy(() =>
  import('features/home').then((m) => ({ default: m.HomePage })),
)

export const DesignSystemPageLazy = lazy(() =>
  import('features/design-system').then((m) => ({ default: m.DesignSystemPage })),
)
