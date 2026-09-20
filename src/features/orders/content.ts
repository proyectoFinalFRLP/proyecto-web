// Copy centralizado de la feature — sin literales sueltos en el JSX. Mismo
// criterio que `features/inventory/content.ts`: si más adelante entra i18n,
// este módulo es el único punto a migrar a claves de traducción.

export const ordersCopy = {
  page: {
    title: 'Órdenes',
    subtitle: 'Seguimiento y procesamiento de la operación diaria.',
    searchLabel: 'Buscar órdenes',
    searchPlaceholder: 'Buscar por ID o destino',
    create: 'Crear orden',
    tableLabel: 'Listado de órdenes',
    empty: 'No hay órdenes que coincidan con el filtro.',
    error: 'No pudimos cargar las órdenes.',
  },
  tabs: {
    all: 'Todas',
    pending: 'Pendientes',
    paid: 'Pagadas',
    cancelled: 'Canceladas',
  },
  columns: {
    id: 'ID de orden',
    date: 'Fecha y hora',
    destination: 'Destino',
    status: 'Estado',
    carrier: 'Operador logístico',
    total: 'Total',
    actions: 'Acciones',
  },
  status: {
    pending: 'Pendiente',
    paid: 'Pagada',
    cancelled: 'Cancelada',
  },
  /** Estados del envío (`Shipment::STATUSES`), con los nombres de las etapas de S08. */
  shipmentStatus: {
    pending: 'Pendiente',
    ready_to_ship: 'Listo para despachar',
    in_transit: 'En tránsito',
    delivered: 'Entregado',
  },
  detail: {
    header: {
      title: (orderLabel: string) => `Orden ${orderLabel}`,
      breadcrumb: {
        label: 'Ruta de navegación',
        orders: 'Órdenes',
      },
      actions: {
        modify: 'Modificar orden',
        print: 'Imprimir remito',
        /** No hay endpoint que genere el remito: la acción queda visible y apagada. */
        printPending: 'El remito todavía no se puede generar desde el sistema.',
      },
      /** La orden todavía no tiene envío creado (TESIS-105). */
      noShipment: 'Sin envío',
      /** Más de un envío para una orden: el modelo lo prohíbe, la pantalla no adivina. */
      duplicatedShipment: 'Envío inconsistente',
    },
    lifecycle: {
      title: 'Ciclo de vida del envío',
      progressLabel: 'Avance del envío',
      stagesLabel: 'Etapas del envío',
      /** Etapa a la que el envío todavía no llegó. */
      notReached: 'Pendiente',
      /** Etapa alcanzada sin un evento que la feche (el envío nace en `pending`). */
      noDate: 'Sin registro',
      logLabel: 'Bitácora del operador logístico',
      emptyLog: 'El operador logístico todavía no reportó eventos.',
      /** "En tránsito · 15 ago · 08:30": el estado normalizado y cuándo pasó. */
      eventMeta: (status: string, when: string) => `${status} · ${when}`,
    },
    shipmentState: {
      none: 'La orden todavía no tiene un envío creado.',
      duplicated: (count: number) =>
        `La orden tiene ${count} envíos registrados y debería tener uno solo. No se muestra ninguno hasta que se corrija.`,
      error: 'No pudimos cargar el envío de la orden.',
      retry: 'Reintentar',
    },
    notFound: 'No encontramos la orden que buscabas.',
    backToOrders: 'Volver a órdenes',
    error: 'No pudimos cargar la orden.',
    /** Marca de "sin dato": el campo existe en el diseño pero no en el modelo. */
    unknown: '—',
    metrics: {
      total: 'Total de la orden',
      /** La orden no registra cómo se pagó. */
      paymentMethodUnknown: 'Medio de pago sin registrar',
      units: 'Unidades',
      lines: (count: number) => `${formatCount(count)} ${count === 1 ? 'línea' : 'líneas'}`,
      carrier: 'Operador logístico',
      /** El courier se asigna al confirmar el despacho. */
      noCarrier: 'Sin asignar',
      serviceTypeUnknown: 'Tipo de servicio sin registrar',
      delivery: 'Entrega',
      delivered: 'Entregada',
      /** Ningún endpoint expone una fecha comprometida de entrega. */
      noEstimate: 'Sin fecha estimada',
    },
    customer: {
      title: 'Datos del cliente',
      fields: {
        name: 'Razón social',
        document: 'Documento',
        contact: 'Contacto',
        phone: 'Teléfono',
        address: 'Domicilio de entrega',
      },
      /** "Av. Corrientes 3247 · CP C1193". */
      addressValue: (address: string, zipCode: string | null) =>
        zipCode === null ? address : `${address} · CP ${zipCode}`,
      footnote: 'La orden no registra contacto ni teléfono del cliente.',
    },
    shipping: {
      title: 'Datos del envío',
      tracking: {
        label: 'Número de seguimiento',
        /** El courier asigna el número al confirmar el despacho (TESIS-47). */
        pending: 'Pendiente de despacho',
        copy: 'Copiar número de seguimiento',
        copied: 'Número de seguimiento copiado.',
        copyFailed: 'No se pudo copiar. Seleccioná el número y copialo a mano.',
      },
      fields: {
        serviceType: 'Tipo de servicio',
        origin: 'Depósito de origen',
      },
      footnote: 'El envío no registra el tipo de servicio ni el depósito de origen.',
    },
    payment: {
      title: 'Resumen de pago',
      subtotal: 'Productos',
      shipping: 'Envío',
      /** El envío todavía no tiene costo: no es gratis, falta cotizarlo. */
      shippingPending: 'Sin cotizar',
      total: 'Total',
      invoice: 'Descargar factura',
      invoicePending: 'La factura todavía no se puede generar desde el sistema.',
    },
    items: {
      title: 'Líneas de la orden',
      columns: {
        sku: 'SKU',
        product: 'Producto',
        unitPrice: 'P. unitario',
        quantity: 'Cant.',
        subtotal: 'Subtotal',
      },
      empty: 'La orden no tiene líneas.',
      /** "3 líneas · 67 unidades". */
      footer: (lines: number, units: number) =>
        `${formatCount(lines)} ${lines === 1 ? 'línea' : 'líneas'} · ${formatCount(units)} ${
          units === 1 ? 'unidad' : 'unidades'
        }`,
    },
  },
  /** El asistente de alta manual (S05 · S06 · S07). */
  wizard: {
    title: 'Nueva orden',
    stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
    progressLabel: 'Avance del alta',
    cancel: 'Cancelar orden',
    /** Etapas en el orden del asistente; cada paso rotula el botón con la siguiente. */
    steps: {
      customer: 'Cliente y productos',
      shipping: 'Destino y origen',
      carrier: 'Cotizaciones',
    },
    next: (stepLabel: string) => `Siguiente: ${stepLabel.toLowerCase()}`,
  },
  /** Paso 1: cliente y productos. */
  draft: {
    customer: {
      title: 'Datos del cliente',
      fields: {
        firstName: 'Nombre',
        lastName: 'Apellido',
        document: 'DNI / CUIT',
      },
      placeholders: {
        firstName: 'Marina',
        lastName: 'Rodríguez',
        document: '20-31298744-9',
      },
      validation: {
        firstNameRequired: 'Ingresá el nombre.',
        lastNameRequired: 'Ingresá el apellido.',
        documentRequired: 'Ingresá el DNI o CUIT.',
      },
    },
    products: {
      title: 'Productos',
      tableLabel: 'Productos de la orden',
      searchLabel: 'Buscar por SKU o nombre',
      searchPlaceholder: 'SKU o nombre del producto',
      noMatches: 'Ningún producto coincide.',
      loadingCatalog: 'Cargando el catálogo…',
      catalogError: 'No pudimos cargar el catálogo de productos.',
      retry: 'Reintentar',
      /** El producto ya tiene su fila: se edita ahí, no se agrega dos veces. */
      alreadyAdded: 'Ya está en la lista',
      quantity: 'Cantidad',
      unitPrice: 'Precio unitario',
      add: 'Agregar SKU',
      /** "Electronics · 1.240 u. disponibles". */
      optionMeta: (category: string | null, stock: string) =>
        category === null ? `${stock} u. disponibles` : `${category} · ${stock} u. disponibles`,
      columns: {
        sku: 'SKU',
        product: 'Producto',
        category: 'Categoría',
        weight: 'Peso unitario',
        unitPrice: 'P. unitario',
        quantity: 'Cantidad',
        subtotal: 'Subtotal',
        actions: 'Acciones',
      },
      /** Un producto anterior a TESIS-102 no tiene categoría. */
      noCategory: '—',
      remove: 'Quitar',
      quantityFor: (sku: string) => `Cantidad de ${sku}`,
      menuFor: (sku: string) => `Acciones de ${sku}`,
      empty: 'Buscá un producto y agregalo para armar la orden.',
      /** "3 SKU seleccionados · las cantidades ajustan el peso estimado". */
      footer: (count: number) =>
        `${formatCount(count)} SKU ${count === 1 ? 'seleccionado' : 'seleccionados'} · las cantidades ajustan el peso estimado`,
    },
    summary: {
      subtotal: 'Subtotal de productos',
      subtotalHint: 'Precio unitario por cantidad de cada SKU. El envío se cotiza en el paso 3.',
      weight: 'Peso total estimado',
      weightHint: 'Calculado sobre el peso unitario declarado de cada SKU.',
    },
  },
  actions: {
    view: 'Ver',
    edit: 'Editar',
    /** Etiqueta accesible del kebab de cada fila. */
    menuFor: (orderId: string) => `Acciones de la orden ${orderId}`,
  },
  cells: {
    /** El courier se asigna al confirmar el despacho: antes de eso no hay. */
    noCarrier: 'Sin asignar',
    /** Una venta cargada a mano puede no tener dirección. */
    noDestination: 'Sin destino',
    noTotal: '—',
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (page: number) => `Ir a la página ${page}`,
    /** "Mostrando 1 a 20 de 4.829 órdenes". */
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${formatCount(total)} ${total === 1 ? 'orden' : 'órdenes'}`,
  },
}

/** Miles con punto, como el resto de los números de la pantalla. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}
