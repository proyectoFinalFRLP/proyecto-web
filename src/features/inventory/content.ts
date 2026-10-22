// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/design-system/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción (ADR-007).

import { formatInteger } from 'shared/utils'

export const inventoryCopy = {
  page: {
    title: 'Inventario',
    subtitle: 'Catálogo maestro de productos y disponibilidad por depósito.',
    searchLabel: 'Buscar productos',
    searchPlaceholder: 'Buscar por SKU o nombre',
    tableLabel: 'Catálogo de productos',
    empty: 'No hay productos que coincidan con el filtro.',
    error: 'No pudimos cargar el catálogo.',
    saved: (productName: string) => `${productName} actualizado.`,
    deleted: (productName: string) => `${productName} eliminado.`,
  },
  tabs: {
    all: 'Todos',
    available: 'Disponibles',
    low: 'Stock bajo',
    out_of_stock: 'Sin stock',
  },
  columns: {
    sku: 'SKU',
    name: 'Nombre',
    category: 'Categoría',
    available: 'Disponible',
    status: 'Estado',
    warehouse: 'Depósito',
    actions: 'Acciones',
  },
  stockStatus: {
    available: 'Disponible',
    low: 'Stock bajo',
    out_of_stock: 'Sin stock',
  },
  cells: {
    noCategory: 'Sin categoría',
    /** Un producto sin unidades en ningún depósito no tiene nodo que mostrar. */
    noWarehouse: 'Sin asignar',
    inTransit: (units: number) => `+${formatInteger(units)} en tránsito`,
    /** "en 3 depósitos" cuando hay más de uno además del principal. */
    moreWarehouses: (count: number) => `en ${count} depósitos`,
  },
  actions: {
    view: 'Ver',
    edit: 'Editar',
    delete: 'Eliminar',
    menuFor: (sku: string) => `Acciones del producto ${sku}`,
  },
  remove: {
    title: 'Eliminar producto',
    body: (productName: string, sku: string) =>
      `Se va a eliminar ${productName} (${sku}). Esta acción no se puede deshacer.`,
    /** El backend responde 409 cuando el producto tiene ventas registradas. */
    blocked:
      'No se puede eliminar: el producto tiene ventas o transferencias registradas. ' +
      'Borrarlo haría desaparecer esos registros.',
    cancel: 'Cancelar',
    confirm: 'Eliminar',
    close: 'Cerrar',
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (page: number) => `Ir a la página ${page}`,
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${formatInteger(total)} ${total === 1 ? 'producto' : 'productos'}`,
  },
  detail: {
    breadcrumb: {
      inventory: 'Inventario',
      catalog: 'Catálogo maestro',
      /** Nombre accesible del <nav>: el lector de pantalla necesita saber qué lista es. */
      label: 'Ruta de navegación',
    },
    actions: {
      /** Baja un CSV con la ficha y el stock por depósito: lo que muestra la pantalla. */
      export: 'Exportar datos',
      edit: 'Editar producto',
    },
    /**
     * El CSV de «Exportar datos». Los rótulos dicen la unidad, porque en la
     * planilla el número va crudo y sin formato.
     */
    export: {
      /** "producto-CAB-6-305.csv". */
      filename: (sku: string) => `producto-${sku}.csv`,
      title: 'Ficha del producto',
      fields: {
        sku: 'SKU',
        name: 'Nombre',
        description: 'Descripción',
        category: 'Categoría',
        packaging: 'Empaque',
        standard: 'Norma técnica',
        weight: 'Peso unitario (kg)',
        length: 'Largo (cm)',
        width: 'Ancho (cm)',
        height: 'Alto (cm)',
        status: 'Estado',
        onHand: 'En depósito (unidades)',
        committed: 'Comprometido (unidades)',
        inTransit: 'En tránsito (unidades)',
        availableToPromise: 'Disponible para prometer (unidades)',
        lowStockThreshold: 'Stock mínimo (unidades)',
        updatedAt: 'Última actualización',
      },
      warehouses: {
        title: 'Distribución por depósito',
        header: ['Depósito', 'Dirección', 'En depósito', 'Comprometido', 'En tránsito', 'Estado'],
      },
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
      // Las medidas («16,5 × 7,8 × 0,9 cm») las escribe `formatDimensions`: el
      // detalle y el aviso de conflicto las tienen que nombrar igual.
      /** Marca de "sin dato" del DS, la misma que usa el dashboard. */
      unknown: '—',
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
        /** TESIS-182: con este total o menos, el producto está en stock bajo. */
        lowStockThreshold: 'Stock mínimo',
      },
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
      // Cuenta también los depósitos que sólo esperan unidades en camino.
      footer: (count: number) =>
        count === 1
          ? '1 depósito con stock o en camino'
          : `${count} depósitos con stock o en camino`,
      empty: 'Este producto no tiene stock asignado en ningún depósito.',
      // En tránsito **por depósito** llega con TESIS-144; el total del producto
      // ya se muestra en el encabezado. Comprometido sí está, por depósito.
      pendingInTransit: 'El en tránsito por depósito llega con el detalle de stock por nodo.',
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
    /** Con alcance `stock`: el modal muestra sólo las cantidades por depósito. */
    stockTitle: (productName: string) => `Editar stock: ${productName}`,
    subtitle: (sku: string) => `Actualizá especificaciones y stock del SKU: ${sku}`,
    close: 'Cerrar',
    conflict: {
      title: 'Alguien editó este producto mientras lo tenías abierto',
      body: 'Tus cambios siguen acá. Si guardás ahora, pisás lo que modificó la otra persona.',
      unknown: 'No pudimos determinar qué cambió.',
      /**
       * Reemplaza a «Guardar cambios» mientras hay un conflicto a la vista. Es
       * el mismo botón y manda lo mismo —el formulario tal como está—; lo que
       * cambia es que el rótulo nombra la consecuencia.
       */
      overwrite: 'Guardar de todos modos',
      labels: {
        name: 'Nombre',
        description: 'Descripción',
        packaging: 'Empaque',
        technicalStandard: 'Norma técnica',
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
      lowStockThreshold: 'Stock mínimo',
      // Los tres textos libres que el detalle ya mostraba: todos
      // opcionales, y el rótulo lo dice como en las medidas del alta.
      description: 'Descripción (opcional)',
      packaging: 'Empaque (opcional)',
      technicalStandard: 'Norma técnica (opcional)',
    },
    placeholders: {
      description: 'Qué es, para qué se usa, qué incluye.',
      packaging: 'ej. Caja de cartón x 10 u',
      technicalStandard: 'ej. IRAM 2178',
    },
    /** TESIS-182: el umbral es de cada producto. */
    lowStockThresholdHelper: 'Con este total o menos, el producto figura con stock bajo.',
    skuHelper: 'El SKU identifica al producto y no se edita.',
    categoryHelper: 'Se usa para agrupar y filtrar el catálogo.',
    noCategory: 'Sin categoría',
    addWarehouse: 'Agregar depósito',
    removeWarehouse: (warehouseName: string) => `Quitar ${warehouseName}`,
    noWarehouses: 'Este producto no tiene stock asignado en ningún depósito.',
    noWarehousesLeft: 'Ya asignaste todos los depósitos disponibles.',
    lastUpdated: (when: string) => `Última actualización ${when}`,
    cancel: 'Cancelar',
    submit: 'Guardar cambios',
  },
  // Canales de venta del detalle (TESIS-139): dónde está publicado el
  // producto y con qué id. Sólo para las empresas con la feature `integrations`.
  channels: {
    title: 'Canales de venta',
    subtitle: 'Publicaciones vinculadas: el stock de OneStock se publica en cada una.',
    externalId: (id: string) => `ID de la publicación: ${id}`,
    empty: 'Este producto todavía no está vinculado a ningún canal.',
    noChannels:
      'No hay canales conectados donde vincularlo. Las conexiones las configura el equipo de OneStock: escribinos para sumar uno.',
    channel: 'Canal',
    externalIdLabel: 'ID de la publicación',
    externalIdHelper: 'Dejalo vacío para buscarla por el SKU del producto.',
    link: 'Vincular',
    linking: 'Vinculando…',
    unlink: 'Desvincular',
    error: 'No pudimos cargar los canales del producto.',
    linked: (channel: string) => `Vinculado con ${channel}. El stock ya se está publicando.`,
    unlinked: (channel: string) => `Se desvinculó de ${channel}.`,
    skuMismatch: 'El SKU de la publicación no coincide con el del producto. Revisalo en el canal.',
    notFound: 'El canal no tiene una publicación con ese ID (o con el SKU del producto).',
    alreadyLinked: 'Esa publicación ya está vinculada a otro producto.',
    channelDown: 'El canal no respondió. Probá de nuevo en unos minutos.',
    unlinkDialog: {
      title: (channel: string) => `Desvincular de ${channel}`,
      description: 'OneStock deja de publicar el stock de este producto en ese canal.',
      confirm: 'Desvincular',
      cancel: 'Cancelar',
      close: 'Cerrar',
    },
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
      dimensions: 'Medidas en cm (largo × ancho × alto, opcionales)',
      length: 'Largo (cm)',
      width: 'Ancho (cm)',
      height: 'Alto (cm)',
      warehousePrimary: 'Depósito principal',
      warehouse: 'Depósito',
      quantity: 'Cantidad',
      lowStockThreshold: 'Stock mínimo',
      description: 'Descripción (opcional)',
      packaging: 'Empaque (opcional)',
      technicalStandard: 'Norma técnica (opcional)',
    },
    /** TESIS-182: el umbral es de cada producto. */
    lowStockThresholdHelper: 'Con este total o menos, el producto figura con stock bajo.',
    placeholders: {
      name: 'ej. Servomotor industrial Z5',
      sku: 'SKU-XXXX-XXX',
      weight: '0.00',
      length: 'Largo',
      width: 'Ancho',
      height: 'Alto',
      description: 'Qué es, para qué se usa, qué incluye.',
      packaging: 'ej. Caja de cartón x 10 u',
      technicalStandard: 'ej. IRAM 2178',
    },
    categoryHelper: 'Se usa para agrupar y filtrar el catálogo.',
    noCategory: 'Sin categoría',
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
    thresholdInteger: 'El stock mínimo debe ser un número entero',
    measurePositive: 'Tiene que ser mayor a 0',
  },
} as const
