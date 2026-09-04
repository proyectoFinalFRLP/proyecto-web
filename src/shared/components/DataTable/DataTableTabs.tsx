import { Tabs } from '@mui/material'

import { FilterTab } from './DataTable.styles'
import type { DataTableTabsProps } from './DataTable.types'

/**
 * Pestañas de filtrado de la tabla.
 *
 * Sobre `Tabs` de MUI y no botones sueltos: trae gratis el patrón ARIA de
 * tablist, la navegación con flechas y el scroll cuando no entran.
 */
export function DataTableTabs({ tabs, activeTabId, onTabChange, label }: DataTableTabsProps) {
  // Si el id activo no está entre las pestañas, MUI avisa por consola y no
  // subraya ninguna. Vale más caer en la primera que romper el render.
  const known = tabs.some((tab) => tab.id === activeTabId)
  const value = known ? activeTabId : tabs[0]?.id

  return (
    <Tabs
      value={value ?? false}
      onChange={(_event, next: string) => onTabChange?.(next)}
      aria-label={label}
      variant="scrollable"
      scrollButtons="auto"
    >
      {tabs.map((tab) => (
        <FilterTab
          key={tab.id}
          value={tab.id}
          label={tab.count === undefined ? tab.label : `${tab.label} (${tab.count})`}
        />
      ))}
    </Tabs>
  )
}
