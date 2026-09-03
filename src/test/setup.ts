import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library sólo se auto-limpia cuando Vitest corre con `globals`. Como
// acá no corre así, el desmontaje va explícito: sin esto cada render deja su
// árbol en el document y el siguiente test encuentra dos nodos con el mismo
// texto.
afterEach(cleanup)
