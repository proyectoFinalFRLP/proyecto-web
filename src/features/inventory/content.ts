// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/design-system/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción (ADR-007).

export const inventoryCopy = {
  page: {
    title: 'Gestión de inventario',
    subtitle: 'Catálogo de productos y stock consolidado por depósito.',
    listHeading: 'Productos',
    empty: 'Todavía no hay productos cargados en esta empresa.',
    stockSummary: (total: number) => `${total} u. en total`,
    saved: (productName: string) => `${productName} actualizado.`,
  },
  detail: {
    breadcrumb: {
      inventory: 'Inventario',
      catalog: 'Catálogo maestro',
      /** Nombre accesible del <nav>: el lector de pantalla necesita saber qué lista es. */
      label: 'Ruta de navegación',
    },
    actions: {
      export: 'Exportar datos',
      // El export queda fuera del alcance mientras el modelo de datos siga
      // incompleto (misma decisión que en el dashboard). El botón se maqueta
      // igual que en el diseño, pero deshabilitado y diciendo por qué: prometer
      // una descarga que no existe es peor que mostrar la acción apagada.
      exportPending: 'La exportación se habilita cuando el modelo de datos esté completo.',
      edit: 'Editar producto',
    },
    specs: {
      title: 'Especificaciones',
      subtitle: 'Datos técnicos y categoría del producto.',
      fields: {
        category: 'Categoría',
        weight: 'Peso unitario',
        dimensions: 'Dimensiones',
        packaging: 'Empaque',
        standard: 'Norma técnica',
        updatedAt: 'Última actualización',
      },
      weightValue: (kilograms: string) => `${kilograms} kg`,
      dimensionsValue: (length: string, width: string, height: string) =>
        `${length} × ${width} × ${height} cm`,
      /** Marca de "sin dato" del DS, la misma que usa el dashboard. */
      unknown: '—',
      pendingBackend: 'Categoría, empaque y norma técnica todavía no existen en la API.',
    },
    master: {
      title: 'Stock maestro',
      subtitle: 'Agregado de todos los depósitos.',
      units: 'unidades',
      warehouseCount: (count: number) =>
        count === 1 ? 'Repartido en 1 depósito.' : `Repartido en ${count} depósitos.`,
      buckets: {
        committed: 'Comprometido',
        inTransit: 'En tránsito',
        availableToPromise: 'Disponible para prometer',
      },
      // Cubre las dos piezas del diseño que la API no puede alimentar: la barra
      // de capacidad ("71 % del umbral máximo de 6.000 unidades"), que necesita
      // un techo por producto, y el desglose por estado de reserva.
      pending:
        'El porcentaje de capacidad y el desglose por reserva esperan datos que la API todavía no expone.',
      edit: 'Editar stock',
    },
    distribution: {
      title: 'Distribución por depósito',
      columns: {
        warehouse: 'Depósito',
        committed: 'Comprom.',
        inTransit: 'En tránsito',
        // El diseño rotula esta columna "Disponible", pero el número que manda
        // la API es el on hand: sin reservas modeladas, disponible y en depósito
        // no son lo mismo y el rótulo tiene que decir cuál de los dos es.
        onHand: 'En depósito',
        status: 'Estado',
      },
      footer: (count: number) =>
        count === 1 ? '1 depósito con stock asignado' : `${count} depósitos con stock asignado`,
      empty: 'Este producto no tiene stock asignado en ningún depósito.',
      pending: 'Comprometido y en tránsito esperan que la API los modele.',
    },
    status: {
      available: 'Disponible',
      low: 'Stock bajo',
      critical: 'Crítico',
      out: 'Sin stock',
    },
    notFound: 'No encontramos el producto que buscabas.',
    backToCatalog: 'Volver al catálogo',
  },
  modal: {
    /** El título lleva el nombre del producto; el subtítulo, el SKU. */
    title: (productName: string) => `Editar producto: ${productName}`,
    subtitle: (sku: string) => `Actualizá especificaciones y stock del SKU: ${sku}`,
    close: 'Cerrar',
    conflict: {
      title: 'Alguien editó este producto mientras lo tenías abierto',
      body: 'Tus cambios siguen acá. Revisá qué se modificó antes de decidir.',
      unknown: 'No pudimos determinar qué cambió.',
      overwrite: 'Guardar de todos modos',
      labels: {
        name: 'Nombre',
        // La descripción no se edita en el modal, pero sí entra en la versión
        // que compara el backend: si cambió, hay que poder nombrarla.
        description: 'Descripción',
        weight: 'Peso',
        dimensions: 'Medidas',
        stockIn: (warehouse: string) => `Stock en ${warehouse}`,
      },
    },
    sections: {
      basic: 'Información básica',
      technical: 'Especificaciones técnicas',
      stock: 'Asignación de stock',
    },
    fields: {
      name: 'Nombre del producto',
      sku: 'Código SKU',
      category: 'Categoría',
      weight: 'Peso (kg)',
      length: 'Largo (cm)',
      width: 'Ancho (cm)',
      height: 'Alto (cm)',
      available: 'Disponible',
    },
    skuHelper: 'El SKU identifica al producto y no se edita.',
    categoryHelper: 'Pendiente de backend: el producto todavía no tiene categoría.',
    addWarehouse: 'Agregar depósito',
    removeWarehouse: (warehouseName: string) => `Quitar ${warehouseName}`,
    noWarehouses: 'Este producto no tiene stock asignado en ningún depósito.',
    noWarehousesLeft: 'Ya asignaste todos los depósitos disponibles.',
    lastUpdated: (when: string) => `Última actualización ${when}`,
    cancel: 'Cancelar',
    submit: 'Guardar cambios',
  },
  createModal: {
    open: 'Nuevo producto',
    title: 'Crear producto',
    subtitle: 'Da de alta una entrada nueva en el catálogo maestro.',
    close: 'Cerrar',
    sections: {
      basic: 'Información básica',
      technical: 'Especificaciones técnicas',
      stock: 'Stock inicial',
    },
    fields: {
      name: 'Nombre del producto',
      sku: 'Código SKU',
      category: 'Categoría',
      weight: 'Peso (kg)',
      dimensions: 'Dimensiones (largo × ancho × alto, cm)',
      warehousePrimary: 'Depósito principal',
      warehouse: 'Depósito',
      quantity: 'Cantidad',
    },
    placeholders: {
      name: 'ej. Servomotor industrial Z5',
      sku: 'SKU-XXXX-XXX',
      weight: '0.00',
      length: 'L',
      width: 'A',
      height: 'H',
    },
    categoryHelper: 'Pendiente de backend: el producto todavía no tiene categoría.',
    addWarehouse: 'Agregar depósito',
    removeRow: (position: number) => `Quitar la fila ${position}`,
    noWarehouses: 'La empresa todavía no tiene depósitos cargados.',
    noWarehousesLeft: 'Ya asignaste todos los depósitos disponibles.',
    selectWarehouse: 'Elegí un depósito',
    cancel: 'Cancelar',
    submit: 'Crear producto',
    submitting: 'Creando…',
    // El backend responde en inglés y con formato de Rails ("Validation failed:
    // Sku has already been taken"). Se traduce acá en vez de mostrarlo crudo.
    skuTaken: 'Ya existe un producto con ese SKU',
  },
  validation: {
    nameRequired: 'El nombre es obligatorio',
    skuRequired: 'El SKU es obligatorio',
    numberRequired: 'Ingresá un número',
    negative: 'No puede ser negativo',
    quantityInteger: 'La cantidad debe ser un número entero',
    warehouseRequired: 'Elegí un depósito',
    duplicateWarehouse: 'No repitas el mismo depósito en dos filas',
  },
} as const
