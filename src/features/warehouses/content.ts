// Copy centralizado de la feature — sin literales sueltos en el JSX.

export const warehousesCopy = {
  page: {
    title: 'Depósitos',
    subtitle: 'Los depósitos físicos de la empresa. Su código postal es el origen de los envíos.',
    create: 'Nuevo depósito',
    tableLabel: 'Depósitos de la empresa',
    empty: 'Todavía no hay depósitos. Cargá el primero para poder asignarle stock.',
    footer: (count: number) => (count === 1 ? '1 depósito' : `${count} depósitos`),
    created: (name: string) => `${name} creado.`,
    saved: (name: string) => `${name} actualizado.`,
    deleted: (name: string) => `${name} eliminado.`,
  },
  columns: {
    name: 'Nombre',
    address: 'Dirección',
    zipCode: 'Código postal',
    storedUnits: 'Unidades guardadas',
  },
  actions: {
    header: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    menuFor: (name: string) => `Acciones del depósito ${name}`,
  },
  form: {
    createTitle: 'Nuevo depósito',
    editTitle: (name: string) => `Editar depósito: ${name}`,
    subtitle: 'El código postal se usa para cotizar los envíos que salen de acá.',
    fields: {
      name: 'Nombre',
      address: 'Dirección',
      zipCode: 'Código postal',
      city: 'Localidad (opcional)',
      province: 'Provincia (opcional)',
      capacity: 'Capacidad en unidades (opcional)',
    },
    placeholders: {
      name: 'Depósito Central',
      address: 'Av. 7 N° 1234',
      zipCode: '1900 o B1900ABC',
      city: 'La Plata',
      province: 'Elegí una provincia',
      capacity: '5000',
    },
    /** Lo que cambia si se carga: el panel mide la ocupación contra este número. */
    capacityHelper: 'Con ella, el panel muestra qué tan lleno está el depósito.',
    noProvince: 'Sin provincia',
    provincesLoading: 'Cargando provincias…',
    provincesError: 'No pudimos cargar las provincias.',
    cancel: 'Cancelar',
    submitCreate: 'Crear depósito',
    submitEdit: 'Guardar cambios',
    close: 'Cerrar',
    failed: 'No pudimos guardar el depósito.',
    validation: {
      nameRequired: 'Ingresá el nombre del depósito.',
      addressRequired: 'Ingresá la dirección.',
      zipCodeRequired: 'Ingresá el código postal.',
      zipCodeFormat: 'Usá 4 dígitos (1900) o el CPA completo (B1900ABC).',
      capacityInteger: 'Ingresá una cantidad entera de unidades, sin puntos ni decimales.',
      capacityPositive: 'Tiene que ser mayor a 0. Dejala vacía si no la sabés.',
      capacityTooLarge: 'Es más de lo que se puede guardar. Revisá el número.',
    },
  },
  remove: {
    title: 'Eliminar depósito',
    body: (name: string) => `Se va a eliminar ${name}. Esta acción no se puede deshacer.`,
    confirm: 'Eliminar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    /** El motivo del 409, por caso. */
    blocked: {
      // La API bloquea por la fila de stock, no por la cantidad: un producto
      // asignado con cero unidades también lo impide.
      stock:
        'No se puede eliminar: hay productos asignados a este depósito, aunque tengan cero unidades.',
      orders: 'No se puede eliminar: salieron ventas de este depósito y las órdenes lo recuerdan.',
      transfers: 'No se puede eliminar: tiene transferencias de stock que salen o llegan a él.',
      shipments: 'No se puede eliminar: se despacharon envíos desde este depósito y lo recuerdan.',
      unknown: 'No se puede eliminar: el depósito tiene registros asociados.',
    },
    failed: 'No pudimos eliminar el depósito.',
  },
  loadError: 'No pudimos cargar los depósitos.',
}
