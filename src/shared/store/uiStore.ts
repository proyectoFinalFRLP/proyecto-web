import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useTenantStore } from './tenantStore'

type ThemeMode = 'light' | 'dark'

interface UiState {
  /** Tema elegido por la persona usuaria. `null` = nunca eligió. */
  themeChoice: ThemeMode | null
  sidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

// Dark es el tema canónico del design system (ADR-007, decisión D1): es el
// default de la app y el fallback para el tenant que no declara preferencia.
const DEFAULT_THEME: ThemeMode = 'dark'

/**
 * Tema con el que arranca la app: la elección explícita del usuario si existe,
 * y si no la del tenant activo (para que el portal de una empresa pueda nacer
 * en modo claro sin que cada visitante tenga que tocar el toggle).
 *
 * Hook y no selector: la derivada cruza dos stores y así el §2.5 de
 * component-structure.md no obliga a repetirla en Header, AuthShell y
 * ThemeWrapper, que son sus tres únicos lectores.
 *
 * Mientras `/tenant-config` está en vuelo no hay branding declarado y cae al
 * default del DS — igual que hace el color primario en esa ventana.
 */
export function useThemeMode(): ThemeMode {
  const themeChoice = useUiStore((state) => state.themeChoice)
  const tenantPreference = useTenantStore((state) => state.config?.branding.theme_mode)

  return themeChoice ?? tenantPreference ?? DEFAULT_THEME
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeChoice: null,
      sidebarOpen: true,
      toggleTheme: () =>
        set((state) => ({
          // El toggle persiste la elección: es lo que hace que el modo del
          // usuario pise al del tenant hasta que borre su localStorage.
          themeChoice: state.themeChoice === 'light' ? 'dark' : 'light',
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ themeChoice: state.themeChoice }),
    },
  ),
)
