import { Alert, Button, MenuItem, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog, LabeledField, LoadingSpinner } from 'shared/components'
import { useIntegrations } from 'shared/hooks/useIntegrations'
import { notify } from 'shared/store'

import { inventoryCopy } from '../../content'
import {
  useLinkProduct,
  useProductMappings,
  useUnlinkProduct,
} from '../../hooks/useProductMappings'
import type { ProductMapping } from '../../types'
import { linkableChannels, linkErrorMessage } from '../../utils/channels'

import {
  ChannelsCard,
  LinkAction,
  LinkForm,
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
 */
export function SalesChannelsCard({ productId, integrationsPath }: SalesChannelsCardProps) {
  const mappings = useProductMappings(productId)
  const integrations = useIntegrations()
  const link = useLinkProduct(productId)
  const unlink = useUnlinkProduct(productId)

  const [channelId, setChannelId] = useState<number | ''>('')
  const [externalId, setExternalId] = useState('')
  const [unlinking, setUnlinking] = useState<ProductMapping | null>(null)

  const channels = linkableChannels(integrations.data ?? [], mappings.data ?? [])
  const selected = channels.find((channel) => channel.integrationId === channelId)

  const submitLink = (event: FormEvent) => {
    event.preventDefault()
    if (!selected) return

    link.mutate(
      { companyIntegrationId: selected.integrationId, externalProductId: externalId.trim() },
      {
        onSuccess: ({ warnings }) => {
          notify(copy.linked(selected.name), 'success')
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

      {mappings.isLoading ? <LoadingSpinner /> : null}
      {mappings.isError ? <Alert severity="error">{copy.error}</Alert> : null}

      {!mappings.isLoading && rows.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {copy.empty}
        </Typography>
      ) : null}

      {rows.map((mapping) => (
        <MappingRow key={mapping.id}>
          <MappingIdentity>
            <Typography variant="bodyLg">{mapping.serviceName}</Typography>
            <Typography variant="labelSm" color="text.secondary">
              {copy.externalId(mapping.externalProductId)}
            </Typography>
          </MappingIdentity>
          <Button color="error" variant="text" size="small" onClick={() => setUnlinking(mapping)}>
            {copy.unlink}
          </Button>
        </MappingRow>
      ))}

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

      {!integrations.isLoading && channels.length === 0 && rows.length === 0 ? (
        <Typography variant="bodyMd" color="text.secondary">
          {copy.noChannels}{' '}
          <Button component={Link} to={integrationsPath} size="small">
            {copy.goToIntegrations}
          </Button>
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
