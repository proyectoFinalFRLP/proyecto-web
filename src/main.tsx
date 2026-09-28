import 'app/theme/fonts'
import { Providers } from 'app/providers/Providers'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { followSessionAcrossTabs } from 'shared/store'

import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

// Cada pestaña tiene su propio store en memoria sobre la misma sesión guardada:
// esto las mantiene de acuerdo cuando otra cierra sesión o entra con otra cuenta.
// Vive lo que vive la página, así que no hace falta dejar de seguirlas.
followSessionAcrossTabs()

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
