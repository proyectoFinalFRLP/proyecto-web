// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/design-system/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción (ADR-007).

export const inventoryCopy = {
  page: {
    title: 'Gestión de inventario',
    subtitle: 'Catálogo de productos y stock consolidado por depósito.',
  },
  modal: {
    /** El título lleva el nombre del producto; el subtítulo, el SKU. */
    title: (productName: string) => `Editar producto: ${productName}`,
    subtitle: (sku: string) => `Actualizá especificaciones y stock del SKU: ${sku}`,
    close: 'Cerrar',
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
    categoryHelper: 'Pendiente de backend: `products` todavía no tiene categoría.',
    addWarehouse: 'Agregar depósito',
    removeWarehouse: (warehouseName: string) => `Quitar ${warehouseName}`,
    noWarehouses: 'Este producto no tiene stock asignado en ningún depósito.',
    noWarehousesLeft: 'Ya asignaste todos los depósitos disponibles.',
    lastUpdated: (when: string) => `Última actualización ${when}`,
    cancel: 'Cancelar',
    submit: 'Guardar cambios',
  },
  validation: {
    nameRequired: 'El nombre es obligatorio',
    numberRequired: 'Ingresá un número',
    negative: 'No puede ser negativo',
    quantityInteger: 'La cantidad debe ser un número entero',
  },
} as const
