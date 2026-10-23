import { useMutation } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api/types'
import { notify } from 'shared/store'

import { fetchShipmentLabel } from '../api'
import type { ShipmentLabel } from '../api'
import { ordersCopy } from '../content'
import type { Shipment } from '../types'
import { labelErrorMessage, labelFileName } from '../utils/shipment'

const labelCopy = ordersCopy.detail.shipping.label

/**
 * Cuánto puede vivir, como mucho, la URL del PDF que se abrió en la pestaña.
 *
 * Hasta TESIS-188 se revocaba al minuto, y a partir de ahí recargar la pestaña
 * daba error. Ahora se libera cuando la pestaña se cierra (ver
 * `TAB_CLOSED_POLL_MS`) y este tope es para la que queda abierta y olvidada.
 * Media hora alcanza para imprimir, reimprimir o recargar; y la URL no puede
 * sobrevivir a la app: el navegador libera las `blob:` cuando se descarga el
 * documento que las creó, así que el tope acota la memoria sin depender de eso.
 */
export const LABEL_URL_LIFETIME_MS = 30 * 60_000

/**
 * Cada cuánto se mira si la pestaña de la etiqueta se cerró, para liberar el
 * PDF. Se consulta `tab.closed` y no un evento de la pestaña: después de cargar
 * el PDF la pestaña ya no es un documento de la app, y sus eventos no llegan.
 */
export const TAB_CLOSED_POLL_MS = 5_000

/**
 * Cuánto vive la URL de una descarga. El navegador lee el archivo al hacer
 * clic en el enlace; el margen es para el que tarda en empezar a bajarlo.
 */
export const DOWNLOAD_URL_LIFETIME_MS = 60_000

type LabelTab = Window | null

type LabelShipment = Pick<Shipment, 'id' | 'labelUrl' | 'trackingNumber'>

interface LabelRequest {
  shipment: LabelShipment
  /** `print` abre el PDF en una pestaña; `download` lo guarda con nombre. */
  mode: 'print' | 'download'
  /** La pestaña que se abrió en el clic. Null si se bloqueó o si es una descarga. */
  tab: LabelTab
}

/** La pestaña recién abierta dice qué espera, en vez de quedar en blanco. */
function showLoading(tab: Window) {
  try {
    tab.document.title = labelCopy.loading
    tab.document.body.textContent = labelCopy.loading
  } catch {
    // Si el navegador no deja escribirla, queda en blanco como antes.
  }
}

function showPdf(tab: Window, pdf: Blob) {
  const url = URL.createObjectURL(pdf)
  tab.location.href = url

  // Se libera al cerrar la pestaña o al vencer el tope, lo que pase primero.
  const release = () => {
    window.clearInterval(poll)
    window.clearTimeout(deadline)
    URL.revokeObjectURL(url)
  }
  const poll = window.setInterval(() => {
    if (tab.closed) release()
  }, TAB_CLOSED_POLL_MS)
  const deadline = window.setTimeout(release, LABEL_URL_LIFETIME_MS)
}

// `<a download>` y no `window.open`: abrir una pestaña después de esperar al
// courier ya no cuenta como acción del usuario, y el navegador la bloquea. Una
// descarga no es un popup.
function savePdf(pdf: Blob, fileName: string) {
  const url = URL.createObjectURL(pdf)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS)
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

function handlePdf({ pdf, fileName }: ShipmentLabel, { shipment, mode, tab }: LabelRequest) {
  if (tab !== null) {
    showPdf(tab, pdf)
    return
  }

  // Imprimir sin pestaña es que el navegador la bloqueó: se guarda el PDF y se
  // avisa, para que no parezca que el botón no hizo nada.
  if (mode === 'print') notify(labelCopy.popupBlocked, 'warning')
  savePdf(pdf, labelFileName(shipment, fileName))
}

/**
 * Imprimir o descargar la etiqueta del envío (TESIS-187, TESIS-188).
 *
 * `GET /shipments/:id/label` pide el JWT, así que el PDF se baja con el
 * cliente HTTP y se abre como una URL local (`blob:`) en una pestaña nueva, o
 * se guarda con un nombre legible (`etiqueta-<seguimiento>.pdf`).
 *
 * La pestaña se abre en el clic, con «Cargando etiqueta…», y se completa cuando
 * llega el PDF: abrirla después de esperar al courier (OCA tarda ~1 s en
 * armarlo) ya no cuenta como una acción del usuario, y el navegador la bloquea
 * como popup. Si la bloquea igual (`window.open` devuelve null), el PDF se
 * descarga y se avisa.
 *
 * Si el backend redirige a la URL que dejó el courier, el navegador sigue la
 * redirección: lo que vuelve no es un PDF, o directamente no se puede leer
 * (otro dominio, sin CORS). En los dos casos se abre esa URL, que es la
 * etiqueta. Un 404 o un 502 cierran la pestaña y se avisan.
 *
 * Qué hacer con la respuesta va en `useMutation` y no en `mutate`: los
 * callbacks de `mutate` no corren si la pantalla se desmontó mientras el
 * courier armaba el PDF, y la pestaña vacía quedaba abierta para siempre.
 * La pestaña y el envío viajan como variables de la mutación.
 */
export function useShipmentLabel() {
  const mutation = useMutation<ShipmentLabel | null, ApiRequestError, LabelRequest>({
    mutationFn: ({ shipment }) => fetchShipmentLabel(shipment.id),
    onSuccess: (label, request) => {
      const { shipment, tab } = request
      if (label !== null) handlePdf(label, request)
      else if (shipment.labelUrl !== null) openExternal(tab, shipment.labelUrl)
      else {
        tab?.close()
        notify(labelCopy.errors.courier, 'error')
      }
    },
    onError: (error, { shipment, tab }) => {
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

  function print(shipment: LabelShipment) {
    const tab = window.open('', '_blank')
    if (tab !== null) showLoading(tab)
    mutation.mutate({ shipment, mode: 'print', tab })
  }

  function download(shipment: LabelShipment) {
    mutation.mutate({ shipment, mode: 'download', tab: null })
  }

  const pendingMode = mutation.isPending ? mutation.variables.mode : null

  return {
    print,
    download,
    printing: pendingMode === 'print',
    downloading: pendingMode === 'download',
    /** Mientras se pide una, la otra acción espera: es el mismo PDF. */
    busy: mutation.isPending,
  }
}
