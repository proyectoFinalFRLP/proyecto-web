// Los destinos de cada fila del panel de actividad.
//
// Viven acá y no en `ActivityPanel`, que está en `shared/` y no puede importar
// el router (architecture.md §3.2): el panel resuelve el destino con lo que le
// pasan, y quien lo monta decide a dónde manda.
//
// En archivo propio y no dentro de `Header.tsx` para poder fijarlo con un test:
// un componente no puede exportar constantes sin romper Fast Refresh
// (`react-refresh/only-export-components`).
//
// `failedEvents` es la puerta de la cola de reintentos desde TESIS-171, que la
// sacó del menú lateral. `ActivityPanel` ya sabía resolverla —`activityPath` la
// usa para las entradas `event_failed`— pero entre TESIS-147 y TESIS-171 nadie
// se la pasaba, así que la fila del evento caído se dibujaba sin enlazar
// aunque la pantalla existiera.
export const ACTIVITY_PATHS = {
  order: (id: number) => `/orders/${id}`,
  failedEvents: '/failed-events',
}
