/// <reference types="vitest/config" />
import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(__dirname, './src/app'),
      features: path.resolve(__dirname, './src/features'),
      shared: path.resolve(__dirname, './src/shared'),
    },
  },
  test: {
    // Los tests conviven con el módulo que prueban; no hay carpeta espejo.
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Sin `globals`: describe/it/expect se importan. Un import explícito es lo
    // mismo que pide el resto del repo, y evita tener que sumar los tipos de
    // Vitest al tsconfig de la app.
    globals: false,
    // `restoreMocks` y no `clearMocks`: además de borrar las llamadas devuelve
    // su implementación original a todo lo espiado con `vi.spyOn`. Es el
    // equivalente de lo que hace rspec-mocks del lado de la API, que descarta
    // los stubs al terminar cada ejemplo. Con `clearMocks` un
    // `vi.spyOn(x, 'y').mockReturnValue(1)` seguiría vivo en los tests
    // siguientes del mismo archivo.
    restoreMocks: true,
  },
})
