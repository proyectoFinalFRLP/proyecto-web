// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/design-system/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción (ADR-007).

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
    inTransit: (units: number) => `+${formatUnits(units)} en tránsito`,
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
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (page: number) => `Ir a la página ${page}`,
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${formatUnits(total)} ${total === 1 ? 'producto' : 'productos'}`,
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

/** Miles con punto, como el resto de los números de la pantalla. */
export function formatUnits(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}
