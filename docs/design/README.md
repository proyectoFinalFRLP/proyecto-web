# Diseño de la interfaz

Fuentes del diseño de Precision OMS. **Esta carpeta es la referencia visual del proyecto**: antes
de implementar una pantalla, se mira acá.

El archivo de Figma que usaban las cards anteriores **está obsoleto** — el motivo y la decisión
completa están en [`ADR-007`](../adr/ADR-007-design-system.md#actualización--dónde-vive-el-diseño-2026-08-30).

## Cómo leer un `.dc.html`

Son las fuentes exportadas del lienzo de Claude Design. No se abren en el navegador: dependen de un
runtime que se inyecta al dibujarlas. **Se leen como código**, que es justamente para lo que sirven:
llevan el marcado, los estilos en línea y qué componente instancia cada parte de la pantalla.

Una pantalla se compone así:

```html
<dc-import name="SideNav" active="inventario" hint-size="240px,100%"></dc-import>
<dc-import name="DataTable" ...></dc-import>
```

Cada `dc-import` apunta a un componente de esta misma carpeta. Si una pantalla necesita algo que no
existe como componente, se agrega el componente — no se dibuja suelto dentro de la pantalla. Esa
regla es la que evita que el diseño derive, y es exactamente lo que le faltaba al Figma anterior.

## Los valores no salen de acá

Colores, tipografía, espaciado, radios y elevación se toman de
[`src/app/theme/tokens.ts`](../../src/app/theme/tokens.ts), que es el único source of truth de
valores. El diseño manda la **forma**; los tokens mandan los **números**.

## Componentes compartidos

| Archivo               | Qué resuelve                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `TopBar.dc.html`      | Barra superior: marca, buscador global, notificaciones, ajustes, avatar                                       |
| `SideNav.dc.html`     | Menú lateral: Inicio · Órdenes · Inventario · Envíos · Reportes · Integraciones, más ayuda y cierre de sesión |
| `DataTable.dc.html`   | Tabla con pestañas de filtro, selección múltiple, menú por fila y paginación                                  |
| `StatusBadge.dc.html` | Badge de estado semántico, siempre con ícono                                                                  |
| `MetricCard.dc.html`  | Tarjeta de métrica con valor, variación y aclaración                                                          |
| `ProgressBar.dc.html` | Barra de progreso delgada, con canal tonal o neutro                                                           |
| `Field.dc.html`       | Campo de formulario: texto, select y numérico, con sus estados                                                |
| `Btn.dc.html`         | Botón sólido, contorno y fantasma                                                                             |
| `ModalFrame.dc.html`  | Marco de modal: cabecera, cuerpo y pie de acciones                                                            |
| `Alert.dc.html`       | Aviso del sistema en sus variantes de intención                                                               |

## Pantallas

Cada una existe en tema oscuro y claro; el tema es una propiedad del artboard, no un archivo
aparte.

| #   | Archivo                      | Pantalla                                    | Card                |
| --- | ---------------------------- | ------------------------------------------- | ------------------- |
| 1   | `S01-Login.dc.html`          | Inicio de sesión                            | TESIS-51            |
| 2   | `S02-Registro.dc.html`       | Registro de cuenta                          | TESIS-51            |
| 3   | `S03-Panel.dc.html`          | Panel de operación                          | TESIS-53 a TESIS-56 |
| 4   | `S04-Ordenes.dc.html`        | Órdenes — listado global                    | TESIS-52            |
| 5   | `S05-Alta1.dc.html`          | Alta de orden — paso 1: cliente y productos | TESIS-57            |
| 6   | `S06-Alta2.dc.html`          | Alta de orden — paso 2: origen y destino    | TESIS-58            |
| 7   | `S07-Alta3.dc.html`          | Alta de orden — paso 3: operador logístico  | TESIS-59            |
| 8   | `S08-Detalle.dc.html`        | Detalle de orden y ciclo de vida del envío  | TESIS-60            |
| 9   | `S09-Modificar.dc.html`      | Modificación de orden                       | TESIS-61            |
| 10  | `S10-Inventario.dc.html`     | Inventario — catálogo maestro               | TESIS-62            |
| 11  | `S11-AltaProducto.dc.html`   | Alta de producto                            | TESIS-63 · TESIS-65 |
| 12  | `S12-Producto.dc.html`       | Detalle de producto (SKU)                   | TESIS-66            |
| 13  | `S13-EditarProducto.dc.html` | Edición de producto                         | TESIS-67            |
| 14  | `S14-Reportes.dc.html`       | Reportes — analítica de la operación        | TESIS-64            |

`PrecisionOMS.dc.html` es la portada del lienzo, no una pantalla del producto. Se renombró sin el espacio para que la ruta no necesite comillas.

## Lo que el diseño todavía no cubre

- **El panel de operación es una sola pantalla** y las cards TESIS-53 a TESIS-56 piden cuatro
  (KPIs, salud de infraestructura, capacidad de stock, actividad reciente). Hay que recortar esas
  cards a una o pedir las tres restantes al diseño.
- **No hay pantalla para cargar las credenciales de una integración** (RF-05). Hoy esa operación
  sólo es accesible por API.
- **No hay pantalla de transferencias entre depósitos**, que el backend ya modela (TESIS-103).

## Vocabulario del producto, tal como está en el diseño

Respetarlo al implementar, porque es donde el Figma anterior se desordenó:

- El producto se llama **Precision OMS**. En ningún lado "OMS Pro" ni "Global OMS".
- Los operadores logísticos son **Andreani, Moova, Correo Argentino y OCASA**.
- Las categorías de producto son las cuatro de `Product::CATEGORIES` en el backend:
  **Electronics, Machinery, Cabling, Power**.
- Los depósitos se nombran como centros de distribución: **CD Ezeiza (BUE-4)**, **CD Córdoba
  (COR-1)**, **CD Rosario (ROS-2)**, **CD Mendoza**.
- Toda la interfaz está **en español**.
