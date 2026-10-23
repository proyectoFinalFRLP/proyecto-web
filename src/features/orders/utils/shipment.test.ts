import { describe, expect, it } from 'vitest'

import type { Shipment, ShipmentEvent, ShipmentStatus } from '../types'

import {
  buildLifecycle,
  closedWithoutDelivery,
  deliveredAt,
  eventsNewestFirst,
  fileNameFromDisposition,
  headerStatus,
  labelErrorMessage,
  labelFileName,
  lifecycleProgress,
  SHIPMENT_STAGES,
  printableLabel,
  shipmentStatusLabel,
  shipmentStatusVariant,
  undeliveredReason,
} from './shipment'

let nextEventId = 1

function event(internalStatus: ShipmentStatus, occurredAt: string): ShipmentEvent {
  nextEventId += 1

  return {
    id: nextEventId,
    internalStatus,
    externalStatus: `raw ${internalStatus}`,
    description: null,
    occurredAt,
  }
}

function shipment(status: ShipmentStatus, events: ShipmentEvent[] = []): Shipment {
  return {
    id: 31,
    orderId: 8829,
    status,
    trackingNumber: null,
    shippingCost: null,
    courier: null,
    labelUrl: null,
    labelAvailable: false,
    externalReference: null,
    originWarehouse: null,
    promisedDeliveryOn: null,
    delayed: false,
    events,
  }
}

describe('headerStatus', () => {
  it('follows the shipment when the order has one', () => {
    expect(headerStatus('paid', { kind: 'single', shipment: shipment('in_transit') })).toEqual({
      label: 'En tránsito',
      variant: 'info',
    })
  })

  it('says a cancelled order is cancelled, even if its shipment is moving', () => {
    expect(headerStatus('cancelled', { kind: 'single', shipment: shipment('in_transit') })).toEqual(
      { label: 'Cancelada', variant: 'error' },
    )
  })

  it('falls back to the order status while the shipment is not resolved', () => {
    expect(headerStatus('pending', undefined)).toEqual({ label: 'Pendiente', variant: 'neutral' })
  })

  it('says the order has no shipment instead of leaving the badge blank', () => {
    expect(headerStatus('paid', { kind: 'none' })).toEqual({
      label: 'Sin envío',
      variant: 'neutral',
    })
  })

  it('warns about a duplicated shipment', () => {
    expect(headerStatus('paid', { kind: 'duplicated', count: 2 }).variant).toBe('warning')
  })
})

describe('buildLifecycle', () => {
  it('marks the stages behind the current one as done and the ones ahead as pending', () => {
    const states = buildLifecycle(shipment('in_transit')).map((stage) => stage.state)

    expect(states).toEqual(['done', 'done', 'current', 'pending'])
  })

  it('leaves nothing current once the shipment is delivered', () => {
    const states = buildLifecycle(shipment('delivered')).map((stage) => stage.state)

    expect(states).toEqual(['done', 'done', 'done', 'done'])
  })

  // La etapa se fecha con el primer evento: los reintentos del courier repiten
  // el estado y no deben mover la fecha en que el envío entró en ella.
  it('dates each stage with the first event that reports it', () => {
    const stages = buildLifecycle(
      shipment('in_transit', [
        event('pending', '2026-08-12T12:42:00Z'),
        event('in_transit', '2026-08-15T11:30:00Z'),
        event('in_transit', '2026-08-16T09:00:00Z'),
      ]),
    )

    expect(stages.map((stage) => stage.reachedAt)).toEqual([
      '2026-08-12T12:42:00Z',
      null,
      '2026-08-15T11:30:00Z',
      null,
    ])
  })

  // El estado vigente sale del envío y no del último evento, que puede haber
  // llegado desordenado.
  it('takes the current stage from the shipment status, not from the last event', () => {
    const stages = buildLifecycle(
      shipment('ready_to_ship', [event('in_transit', '2026-08-15T11:30:00Z')]),
    )

    expect(stages.find((stage) => stage.state === 'current')?.status).toBe('ready_to_ship')
  })

  // TESIS-188: devuelto o cancelado cierra el ciclo donde estaba, y la entrega
  // no se dibuja como un paso que todavía puede pasar.
  describe('a shipment that ended without a delivery', () => {
    it('shows the stages it went through and then where it ended', () => {
      const stages = buildLifecycle(
        shipment('returned', [
          event('pending', '2026-08-12T12:42:00Z'),
          event('in_transit', '2026-08-15T11:30:00Z'),
          event('returned', '2026-08-20T10:00:00Z'),
        ]),
      )

      expect(stages).toEqual([
        { status: 'pending', state: 'done', reachedAt: '2026-08-12T12:42:00Z' },
        { status: 'ready_to_ship', state: 'done', reachedAt: null },
        { status: 'in_transit', state: 'done', reachedAt: '2026-08-15T11:30:00Z' },
        { status: 'returned', state: 'closed', reachedAt: '2026-08-20T10:00:00Z' },
      ])
    })

    // Cada envío nace pendiente: aunque la bitácora esté vacía, pasó por ahí.
    it('starts from pending when it was cancelled before any event', () => {
      expect(
        buildLifecycle(shipment('cancelled')).map(({ status, state }) => [status, state]),
      ).toEqual([
        ['pending', 'done'],
        ['cancelled', 'closed'],
      ])
    })

    it('never offers the delivery as a stage still to come', () => {
      const stages = buildLifecycle(
        shipment('cancelled', [event('in_transit', '2026-08-15T11:30:00Z')]),
      )

      expect(stages.map((stage) => stage.status)).not.toContain('delivered')
      expect(stages.some((stage) => stage.state === 'pending')).toBe(false)
    })
  })

  // La API mandó un estado que el front todavía no conoce: se muestra donde
  // quedó, sin afirmar que es un final.
  it('shows an unknown status as the current one, after what it went through', () => {
    const unknown = 'lost' as ShipmentStatus
    const stages = buildLifecycle(shipment(unknown, [event('pending', '2026-08-12T12:42:00Z')]))

    expect(stages.map(({ status, state }) => [status, state])).toEqual([
      ['pending', 'done'],
      ['lost', 'current'],
    ])
  })
})

describe('lifecycleProgress', () => {
  it('goes from 0 when just created to 100 when delivered', () => {
    expect(SHIPMENT_STAGES.map(lifecycleProgress)).toEqual([0, 33, 67, 100])
  })

  // El ciclo terminó, aunque no en la entrega: el tono de la barra lo dice.
  it('is complete for a returned or cancelled shipment', () => {
    expect(lifecycleProgress('returned')).toBe(100)
    expect(lifecycleProgress('cancelled')).toBe(100)
  })

  it('does not go below zero for a status it does not know', () => {
    expect(lifecycleProgress('lost' as ShipmentStatus)).toBe(0)
  })
})

describe('the shipment status', () => {
  it('names the statuses that end without a delivery', () => {
    expect(shipmentStatusLabel('returned')).toBe('Devuelto')
    expect(shipmentStatusLabel('cancelled')).toBe('Cancelado')
  })

  // Devuelto cierra sin nada que hacer; cancelado pide atención, como la orden.
  it('paints a returned shipment neutral and a cancelled one as an error', () => {
    expect(shipmentStatusVariant('returned')).toBe('neutral')
    expect(shipmentStatusVariant('cancelled')).toBe('error')
  })

  it('names a status it does not know, in a neutral tone', () => {
    const unknown = 'lost' as ShipmentStatus

    expect(shipmentStatusLabel(unknown)).toBe('Estado desconocido')
    expect(shipmentStatusVariant(unknown)).toBe('neutral')
  })

  it('tells which statuses end without a delivery', () => {
    expect(closedWithoutDelivery('returned')).toBe(true)
    expect(closedWithoutDelivery('cancelled')).toBe(true)
    expect(closedWithoutDelivery('delivered')).toBe(false)
  })
})

describe('deliveredAt', () => {
  it('has no date for a shipment that has not arrived', () => {
    expect(deliveredAt(shipment('in_transit', [event('in_transit', '2026-08-15T11:30:00Z')]))).toBe(
      null,
    )
  })

  it('returns when a delivered shipment arrived', () => {
    expect(
      deliveredAt(
        shipment('delivered', [
          event('in_transit', '2026-08-15T11:30:00Z'),
          event('delivered', '2026-08-26T17:05:00Z'),
        ]),
      ),
    ).toBe('2026-08-26T17:05:00Z')
  })
})

describe('eventsNewestFirst', () => {
  it('puts the latest event first without touching the shipment', () => {
    const events = [
      event('pending', '2026-08-12T12:42:00Z'),
      event('in_transit', '2026-08-15T11:30:00Z'),
    ]
    const source = shipment('in_transit', events)

    expect(eventsNewestFirst(source).map((item) => item.internalStatus)).toEqual([
      'in_transit',
      'pending',
    ])
    // El envío viene de la caché de React Query: invertirlo en el lugar
    // cambiaría el orden para cualquier otro que lo lea.
    expect(source.events.map((item) => item.internalStatus)).toEqual(['pending', 'in_transit'])
  })
})

describe('printableLabel', () => {
  it('keeps the https link the courier returned', () => {
    expect(printableLabel('https://andreani.test/etiquetas/AND-9920.pdf')).toBe(
      'https://andreani.test/etiquetas/AND-9920.pdf',
    )
  })

  it('keeps an http one too: some carriers still serve the pdf without tls', () => {
    expect(printableLabel('http://oca.test/label/123')).toBe('http://oca.test/label/123')
  })

  it('has nothing to show without a label', () => {
    expect(printableLabel(null)).toBeNull()
    expect(printableLabel('   ')).toBeNull()
  })

  // La URL la devuelve el courier y la plantilla la mapea tal cual: un `href`
  // con `javascript:` corre al hacer clic, en el navegador del operador.
  it('refuses a link that is not a web address', () => {
    expect(printableLabel('javascript:alert(document.cookie)')).toBeNull()
    expect(printableLabel('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  // Una relativa apuntaría a nuestro sitio, y el destino es el del courier.
  it('refuses something that is not an absolute url', () => {
    expect(printableLabel('/etiquetas/AND-9920.pdf')).toBeNull()
    expect(printableLabel('no es una url')).toBeNull()
  })
})

describe('labelErrorMessage', () => {
  it('says the shipment has no label when the api answers 404', () => {
    expect(labelErrorMessage(404)).toBe('El envío no tiene una etiqueta para imprimir.')
  })

  // 502: el courier contestó, pero no con un PDF.
  it('blames the courier when the api answers 502', () => {
    expect(labelErrorMessage(502)).toBe(
      'El operador no devolvió la etiqueta. Probá de nuevo en unos minutos.',
    )
  })

  it('falls back to a generic message for anything else', () => {
    expect(labelErrorMessage(500)).toBe('No pudimos descargar la etiqueta. Probá de nuevo.')
    expect(labelErrorMessage(undefined)).toBe('No pudimos descargar la etiqueta. Probá de nuevo.')
  })

  // Ya lo avisa el cliente HTTP: dos avisos dirían lo mismo.
  it('says nothing about an expired session or a missing permission', () => {
    expect(labelErrorMessage(401)).toBeNull()
    expect(labelErrorMessage(403)).toBeNull()
  })
})

describe('fileNameFromDisposition', () => {
  it('reads a quoted file name', () => {
    expect(fileNameFromDisposition('attachment; filename="etiqueta-OCA-1.pdf"')).toBe(
      'etiqueta-OCA-1.pdf',
    )
  })

  it('reads an unquoted one', () => {
    expect(fileNameFromDisposition('inline; filename=etiqueta.pdf')).toBe('etiqueta.pdf')
  })

  // `filename*` es el que lleva tildes: gana sobre el común.
  it('prefers the utf-8 name over the plain one', () => {
    expect(
      fileNameFromDisposition(
        'attachment; filename="etiqueta.pdf"; filename*=UTF-8\'\'etiqueta-env%C3%ADo.pdf',
      ),
    ).toBe('etiqueta-envío.pdf')
  })

  it('falls back to the plain name when the utf-8 one is badly escaped', () => {
    expect(
      fileNameFromDisposition('attachment; filename="etiqueta.pdf"; filename*=UTF-8\'\'%E0%A4%A'),
    ).toBe('etiqueta.pdf')
  })

  it('has no name when the header does not carry one', () => {
    expect(fileNameFromDisposition('inline')).toBeNull()
    expect(fileNameFromDisposition('attachment; filename=""')).toBeNull()
  })

  // Viene de la red: una carpeta en el nombre no llega al diálogo de guardado.
  it('strips folder separators from the name', () => {
    expect(fileNameFromDisposition('attachment; filename="../../etc/passwd"')).toBe(
      '..-..-etc-passwd',
    )
  })
})

describe('labelFileName', () => {
  it('keeps the name the api suggested', () => {
    expect(labelFileName({ id: 31, trackingNumber: 'OCA-1' }, 'de-la-api.pdf')).toBe(
      'de-la-api.pdf',
    )
  })

  it('names the file after the tracking number otherwise', () => {
    expect(labelFileName({ id: 31, trackingNumber: 'OCA-0012345678' }, null)).toBe(
      'etiqueta-OCA-0012345678.pdf',
    )
  })

  it('cleans a tracking number that could not be a file name', () => {
    expect(labelFileName({ id: 31, trackingNumber: 'AND/99:20' }, null)).toBe(
      'etiqueta-AND-99-20.pdf',
    )
  })

  it('falls back to the shipment id without a tracking number', () => {
    expect(labelFileName({ id: 31, trackingNumber: null }, null)).toBe('etiqueta-envio-31.pdf')
  })
})

describe('undeliveredReason', () => {
  it('says why a returned or cancelled shipment will not be delivered', () => {
    expect(undeliveredReason('returned')).toBe('Devuelto al remitente')
    expect(undeliveredReason('cancelled')).toBe('Envío cancelado')
  })

  it('has no reason for a shipment that can still arrive or already did', () => {
    for (const status of SHIPMENT_STAGES) expect(undeliveredReason(status)).toBeNull()
  })
})
