import { lazy } from 'react'

export const HomePageLazy = lazy(() =>
  import('features/home').then((m) => ({ default: m.HomePage })),
)
