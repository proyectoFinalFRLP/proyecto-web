import { Alert, AlertTitle, Button, MenuItem, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ConfirmDialog, LabeledField, LoadingSpinner } from 'shared/components'
import { useIntegrations } from 'shared/hooks/useIntegrations'
import { notify } from 'shared/store'

import { inventoryCopy } from '../../content'
import {
  useLinkProduct,
  useResyncMapping,
  useUnlinkProduct,
  useWatchedProductMappings,
} from '../../hooks/useProductMappings'
import type { ProductMapping } from '../../types'
import {
  canRetry,
  linkableChannels,
  linkErrorMessage,
  mappingSyncStatus,
  resyncErrorMessage,
  stockSyncWarnings,
} from '../../utils/channels'

import {
  ChannelsCard,
  LinkAction,
  LinkForm,
  MappingActions,
  MappingIdentity,
  MappingRow,
} from './SalesChannelsCard.styles'
import type { SalesChannelsCardProps } from './SalesChannelsCard.types'

const { channels: copy } = inventoryCopy

/**
 * «Canales de venta» del detalle de producto (TESIS-139): dónde está publicado
 * el producto, vincularlo con un canal conectado y desvincularlo.
 *
 * A diferencia de las otras tarjetas del detalle, trae sus propios datos: los
 * vínculos tienen su endpoint y sus mutaciones, y así la página no carga con
 * ellos cuando la empresa no tiene la feature `integrations`.
 *
 * Desde TESIS-177 también dice si el stock llegó a cada canal: cuándo se
 * publicó o por qué no, con «Reintentar». Arriba avisa de los canales que no
 * pueden publicar (les falta configuración) o que tienen productos sin publicar:
 * desde que se sacó la pantalla de Integraciones (TESIS-140), ésta es la única
 * que muestra el estado de un canal. Vincular y «Reintentar» sólo encolan la
 * publicación: mientras el job no escribe el resultado la fila dice
 * «Publicando…» (ver `useWatchedProductMappings`).
 */
export function SalesChannelsCard({ productId }: SalesChannelsCardProps) {
  const { mappings, watch, isPublishing, timedOut } = useWatchedProductMappings(productId)
  const integrations = useIntegrations()
  const link = useLinkProduct(productId)
  const unlink = useUnlinkProduct(productId)

  const [channelId, setChannelId] = useState<number | ''>('')
  const [externalId, setExternalId] = useState('')
  const [unlinking, setUnlinking] = useState<ProductMapping | null>(null)
  // El rechazo del último «Reintentar» de cada canal, con el `lastSyncedAt` que
  // tenía la fila: si un refetch trae un intento nuevo, el rechazo ya es viejo.
  const [retryErrors, setRetryErrors] = useState<
    Record<number, { message: string; baseline: string | null }>
  >({})

  const resync = useResyncMapping(productId, {
    onMutate: (mapping) => setRetryErrors(({ [mapping.id]: _previous, ...rest }) => rest),
    onSuccess: (mapping) => {
      notify(copy.retryQueued(mapping.serviceName), 'success')
      watch(mapping.id, mapping.lastSyncedAt)
    },
    onError: (error, mapping) =>
      setRetryErrors((current) => ({
        ...current,
        [mapping.id]: { message: resyncErrorMessage(error), baseline: mapping.lastSyncedAt },
      })),
  })

  const channels = linkableChannels(integrations.data ?? [], mappings.data ?? [])
  const selected = channels.find((channel) => channel.integrationId === channelId)

  const submitLink = (event: FormEvent) => {
    event.preventDefault()
    if (!selected) return

    link.mutate(
      { companyIntegrationId: selected.integrationId, externalProductId: externalId.trim() },
      {
        onSuccess: ({ mapping, warnings }) => {
          notify(copy.linked(selected.name), 'success')
          // El vínculo nuevo también publica por job: hasta que llegue el
          // resultado dice «Publicando…» y no ofrece «Reintentar».
          watch(mapping.id, mapping.lastSyncedAt)
          if (warnings.length > 0) notify(copy.skuMismatch, 'warning')
          setChannelId('')
          setExternalId('')
        },
        onError: (error) => notify(linkErrorMessage(error), 'error'),
      },
    )
  }

  const confirmUnlink = () => {
    if (!unlinking) return
    const mapping = unlinking

    unlink.mutate(mapping.id, {
      onSuccess: () => {
        notify(copy.unlinked(mapping.serviceName), 'success')
        setUnlinking(null)
      },
      onError: (error) => notify(error.message, 'error'),
    })
  }

  const rows = mappings.data ?? []
  const warnings = stockSyncWarnings(integrations.data ?? [])

  return (
    <ChannelsCard>
      <div>
        <Typography variant="h3" component="h2">
          {copy.title}
        </Typography>
        <Typography variant="bodyMd" color="text.secondary">
          {copy.subtitle}
        </Typography>
      </div>

      {warnings.map((warning) => (
        // Es un estado que se queda, no un evento: `status` para que el lector
        // de pantalla no lo anuncie cada vez que se abre el detalle.
        <Alert key={warning.integrationId} severity="warning" role="status">
          <AlertTitle>{copy.stockSyncTitle(warning.name)}</AlertTitle>
          {warning.messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </Alert>
      ))}

      {mappings.isLoading ? <LoadingSpinner /> : null}
      {mappings.isError ? <Alert severity="error">{copy.error}</Alert> : null}

      {!mappings.isLoading && rows.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {copy.empty}
        </Typography>
      ) : null}

      {rows.map((mapping) => {
        const publishing = isPublishing(mapping)
        const retrying = resync.pendingIds.includes(mapping.id)
        const retryError = retryErrors[mapping.id]
        const rejection = retryError?.baseline === mapping.lastSyncedAt ? retryError.message : null
        const synced = mappingSyncStatus(mapping)
        // Mientras publica, el resultado viejo ya no vale. Y si el rechazo dice
        // lo mismo que la fila, se muestra una vez.
        const status = publishing
          ? { tone: 'ok' as const, text: copy.publishing }
          : synced && synced.text !== rejection
            ? synced
            : null

        return (
          <MappingRow key={mapping.id}>
            <MappingIdentity>
              <Typography variant="bodyLg">{mapping.serviceName}</Typography>
              <Typography variant="labelSm" color="text.secondary">
                {copy.externalId(mapping.externalProductId)}
              </Typography>
              {status ? (
                <Typography
                  variant="labelSm"
                  color={status.tone === 'error' ? 'error' : 'text.secondary'}
                >
                  {status.text}
                </Typography>
              ) : null}
              {timedOut(mapping) ? (
                <Typography variant="labelSm" color="text.secondary">
                  {copy.publishSlow}
                </Typography>
              ) : null}
              {rejection ? (
                <Typography variant="labelSm" color="error" role="alert">
                  {rejection}
                </Typography>
              ) : null}
            </MappingIdentity>
            <MappingActions>
              {canRetry(mapping) && !publishing ? (
                <Button
                  variant="text"
                  size="small"
                  disabled={retrying}
                  onClick={() => resync.retry(mapping)}
                >
                  {retrying ? copy.retrying : copy.retry}
                </Button>
              ) : null}
              <Button
                color="error"
                variant="text"
                size="small"
                onClick={() => setUnlinking(mapping)}
              >
                {copy.unlink}
              </Button>
            </MappingActions>
          </MappingRow>
        )
      })}

      {channels.length > 0 ? (
        <LinkForm onSubmit={submitLink} noValidate>
          <LabeledField label={copy.channel}>
            <TextField
              select
              value={channelId}
              onChange={(event) => setChannelId(Number(event.target.value))}
              fullWidth
            >
              {channels.map((channel) => (
                <MenuItem key={channel.integrationId} value={channel.integrationId}>
                  {channel.name}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField label={copy.externalIdLabel} helperText={copy.externalIdHelper}>
            <TextField
              value={externalId}
              onChange={(event) => setExternalId(event.target.value)}
              fullWidth
            />
          </LabeledField>

          <LinkAction>
            <Button type="submit" variant="contained" disabled={!selected || link.isPending}>
              {link.isPending ? copy.linking : copy.link}
            </Button>
          </LinkAction>
        </LinkForm>
      ) : null}

      {/* Sin canales conectados no hay a dónde mandar al usuario: la pantalla
          de Integraciones se sacó en TESIS-140 porque las conexiones las
          administra el equipo. El aviso dice a quién pedírselo. */}
      {!integrations.isLoading && channels.length === 0 && rows.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {copy.noChannels}
        </Typography>
      ) : null}

      <ConfirmDialog
        open={unlinking !== null}
        title={unlinking ? copy.unlinkDialog.title(unlinking.serviceName) : ''}
        description={copy.unlinkDialog.description}
        confirmLabel={copy.unlinkDialog.confirm}
        cancelLabel={copy.unlinkDialog.cancel}
        closeLabel={copy.unlinkDialog.close}
        tone="destructive"
        busy={unlink.isPending}
        onConfirm={confirmUnlink}
        onClose={() => setUnlinking(null)}
      />
    </ChannelsCard>
  )
}
