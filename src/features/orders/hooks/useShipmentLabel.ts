import { useMutation } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'
import { notify } from 'shared/store'

import { fetchShipmentLabel } from '../api'
import { ordersCopy } from '../content'
import type { Shipment } from '../types'
import { labelErrorMessage } from '../utils/shipment'

const labelCopy = ordersCopy.detail.shipping.label

/**
 * Cuánto vive la URL del PDF después de abrirlo. La pestaña nueva la carga en
 * el momento, pero revocarla en el acto le gana a esa carga en algunos
 * navegadores; un minuto alcanza de sobra y no deja el PDF en memoria.
 */
export const LABEL_URL_LIFETIME_MS = 60_000

type LabelTab = Window | null

function showPdf(tab: LabelTab, pdf: Blob) {
  const url = URL.createObjectURL(pdf)

  if (tab === null) window.open(url, '_blank')
  else tab.location.href = url

  window.setTimeout(() => URL.revokeObjectURL(url), LABEL_URL_LIFETIME_MS)
}

// El destino es el sitio del courier: no se le entrega la referencia a esta
// ventana, igual que el enlace que había antes.
function openExternal(tab: LabelTab, url: string) {
  if (tab === null) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  tab.opener = null
  tab.location.href = url
}

/**
 * Imprimir la etiqueta del envío (TESIS-187).
 *
 * `GET /shipments/:id/label` pide el JWT, así que el PDF se baja con el
 * cliente HTTP y se abre como una URL local (`blob:`) en una pestaña nueva.
 *
 * La pestaña se abre en el clic, vacía, y se completa cuando llega el PDF:
 * abrirla después de esperar al courier (OCA tarda ~1 s en armarlo) ya no
 * cuenta como una acción del usuario, y el navegador la bloquea como popup.
 *
 * Si el backend redirige a la URL que dejó el courier, el navegador sigue la
 * redirección: lo que vuelve no es un PDF, o directamente no se puede leer
 * (otro dominio, sin CORS). En los dos casos se abre esa URL, que es la
 * etiqueta. Un 404 o un 502 cierran la pestaña y se avisan.
 */
export function useShipmentLabel() {
  const mutation = useMutation<Blob | null, ApiRequestError, number>({
    mutationFn: fetchShipmentLabel,
  })

  function print(shipment: Pick<Shipment, 'id' | 'labelUrl'>) {
    const tab = window.open('', '_blank')

    mutation.mutate(shipment.id, {
      onSuccess: (pdf) => {
        if (pdf !== null) showPdf(tab, pdf)
        else if (shipment.labelUrl !== null) openExternal(tab, shipment.labelUrl)
        else {
          tab?.close()
          notify(labelCopy.errors.courier, 'error')
        }
      },
      onError: (error) => {
        // Sin status no contestó la API sino la red: la redirección al sitio
        // del courier que no deja leer su respuesta.
        if (error.status === undefined && shipment.labelUrl !== null) {
          openExternal(tab, shipment.labelUrl)
          return
        }

        tab?.close()
        const message = labelErrorMessage(error.status)
        if (message !== null) notify(message, 'error')
      },
    })
  }

  return { print, printing: mutation.isPending }
}
