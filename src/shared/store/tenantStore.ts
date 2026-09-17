import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { isFeatureEnabled, tenantConfigSchema } from '../api/tenant'
import type { TenantConfig, TenantFeature } from '../api/tenant'
import { currentTenantSlug } from '../utils/tenant'

interface TenantState {
  /** Slug del host o del override. `null` = no se pudo resolver ninguno. */
  slug: string | null
  /** Config del backend. `null` mientras está en vuelo (o si nunca llegó). */
  config: TenantConfig | null
  setConfig: (config: TenantConfig) => void
}

// Lo que hay en localStorage puede venir de otra versión de la app, de otra
// empresa o de una edición a mano: se valida con el mismo schema con el que se
// valida la respuesta del backend, en vez de castearlo.
//
// La config guardada vale **sólo** para el tenant que el host pide ahora: dos
// subdominios no comparten localStorage, pero abrir `?tenant=sur` en una pestaña
// que venía de `norte` sí mostraría la marca equivocada hasta el primer fetch.
function cachedConfigFor(slug: string | null, value: unknown): TenantConfig | null {
  if (typeof value !== 'object' || value === null) return null

  const { slug: cachedSlug, config } = value as Record<string, unknown>
  if (typeof cachedSlug !== 'string' || cachedSlug !== slug) return null

  const parsed = tenantConfigSchema.safeParse(config)
  return parsed.success ? parsed.data : null
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      // El slug no es estado que la app cambie: sale del host y ya está resuelto
      // antes de que exista el store.
      slug: currentTenantSlug(),
      config: null,
      setConfig: (config) => set({ config }),
    }),
    {
      name: 'tenant-store',
      version: 1,
      partialize: (state) => ({ slug: state.slug, config: state.config }),
      // Rehidratar la config es lo que evita el splash en cada reload.
      merge: (persisted, current) => ({
        ...current,
        config: cachedConfigFor(current.slug, persisted),
      }),
    },
  ),
)

/** Escritura desde afuera de React (el `queryFn` que trae la config). */
export function setTenantConfig(config: TenantConfig): void {
  useTenantStore.getState().setConfig(config)
}

/**
 * Nombre con el que la empresa se muestra: el del branding si lo declaró y el
 * nombre legal si no. La regla vive acá y no en cada pantalla para que el
 * TopNavBar y el login no puedan mostrar nombres distintos.
 */
export function useTenantName(): string | undefined {
  return useTenantStore((state) => state.config?.branding.display_name ?? state.config?.name)
}

/** `true` sólo si la config activa declara la feature encendida. */
export function useTenantFeature(feature: TenantFeature): boolean {
  return useTenantStore((state) => isFeatureEnabled(state.config?.features, feature))
}
