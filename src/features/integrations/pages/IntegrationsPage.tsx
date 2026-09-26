import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import type { IntegrationService, ServiceType } from 'shared/api'
import { ConfirmDialog, LoadingSpinner, PageWrapper } from 'shared/components'
import { useIntegrations } from 'shared/hooks/useIntegrations'
import { notify } from 'shared/store'

import { ConnectIntegrationModal } from '../components/ConnectIntegrationModal'
import { IntegrationCard } from '../components/IntegrationCard'
import { integrationsCopy } from '../content'
import {
  useDisconnectIntegration,
  useSaveIntegration,
  useTestIntegration,
  useToggleIntegration,
} from '../hooks/useIntegrationActions'

const { page, groups, feedback, disconnect: disconnectCopy } = integrationsCopy

const GROUP_ORDER: ServiceType[] = ['ecommerce', 'courier']

/**
 * Integraciones: qué proveedores puede conectar la empresa, en qué estado está
 * cada uno y las acciones para conectarlo, probarlo, pausarlo o desconectarlo,
 * sin Postman ni backoffice (TESIS-139).
 *
 * La ruta está detrás del feature flag `integrations` del tenant (TESIS-121).
 */
export function IntegrationsPage() {
  const { data, isLoading, isError, refetch } = useIntegrations()
  const [editing, setEditing] = useState<IntegrationService | null>(null)
  const [disconnecting, setDisconnecting] = useState<IntegrationService | null>(null)

  const save = useSaveIntegration()
  const test = useTestIntegration()
  const toggle = useToggleIntegration()
  const disconnect = useDisconnectIntegration()

  const runTest = (service: IntegrationService) => {
    test.mutate(service.serviceId, {
      onSuccess: (result) =>
        result.ok
          ? notify(feedback.testOk(result.message), 'success')
          : notify(feedback.testFailed(result.message), 'error'),
      onError: (error) => notify(feedback.testFailed(error.message), 'error'),
    })
  }

  const openConnect = (service: IntegrationService) => {
    save.reset()
    setEditing(service)
  }

  // Después de guardar se prueba sola: confirma que la cuenta anda y completa
  // la configuración que el proveedor sabe (en Shopify, la ubicación de stock).
  const submitConnection = (payload: Parameters<typeof save.mutate>[0]['payload']) => {
    if (!editing) return
    const service = editing

    save.mutate(
      { serviceId: service.serviceId, payload },
      {
        onSuccess: () => {
          notify(feedback.saved(service.name), 'success')
          setEditing(null)
          if (service.testable) runTest(service)
        },
      },
    )
  }

  const toggleActive = (service: IntegrationService) => {
    const isActive = !service.isActive
    toggle.mutate(
      { serviceId: service.serviceId, isActive },
      {
        onSuccess: () =>
          notify(
            isActive ? feedback.activated(service.name) : feedback.deactivated(service.name),
            'success',
          ),
        onError: (error) => notify(error.message, 'error'),
      },
    )
  }

  const confirmDisconnect = () => {
    if (!disconnecting) return
    const service = disconnecting

    disconnect.mutate(service.serviceId, {
      onSuccess: () => {
        notify(feedback.disconnected(service.name), 'success')
        setDisconnecting(null)
      },
      onError: (error) => notify(error.message, 'error'),
    })
  }

  const isTesting = (serviceId: number) => test.isPending && test.variables === serviceId

  const isBusy = (serviceId: number) =>
    (save.isPending && save.variables.serviceId === serviceId) ||
    (test.isPending && test.variables === serviceId) ||
    (toggle.isPending && toggle.variables.serviceId === serviceId) ||
    (disconnect.isPending && disconnect.variables === serviceId)

  const services = data ?? []

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Box>
          <Typography variant="displaySm">{page.title}</Typography>
          <Typography variant="bodyLg" color="text.secondary">
            {page.subtitle}
          </Typography>
        </Box>

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                {page.retry}
              </Button>
            }
          >
            {page.error}
          </Alert>
        ) : null}

        {isLoading ? <LoadingSpinner /> : null}

        {!isLoading && !isError && services.length === 0 ? (
          <Typography variant="bodyMd" color="text.secondary">
            {page.empty}
          </Typography>
        ) : null}

        {GROUP_ORDER.map((type) => {
          const group = services.filter((service) => service.type === type)
          if (group.length === 0) return null

          return (
            <Stack key={type} spacing={2} component="section" aria-label={groups[type]}>
              <Typography variant="h2">{groups[type]}</Typography>
              <Grid container spacing={2}>
                {group.map((service) => (
                  <Grid key={service.serviceId} size={{ xs: 12, md: 6, lg: 4 }}>
                    <IntegrationCard
                      service={service}
                      busy={isBusy(service.serviceId)}
                      testing={isTesting(service.serviceId)}
                      onConnect={openConnect}
                      onTest={runTest}
                      onToggle={toggleActive}
                      onDisconnect={setDisconnecting}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )
        })}
      </Stack>

      <ConnectIntegrationModal
        service={editing}
        submitting={save.isPending}
        submitError={save.error}
        onSubmit={submitConnection}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={disconnecting !== null}
        title={disconnecting ? disconnectCopy.title(disconnecting.name) : ''}
        description={disconnectCopy.description}
        confirmLabel={disconnectCopy.confirm}
        cancelLabel={disconnectCopy.cancel}
        closeLabel={disconnectCopy.close}
        tone="destructive"
        busy={disconnect.isPending}
        onConfirm={confirmDisconnect}
        onClose={() => setDisconnecting(null)}
      />
    </PageWrapper>
  )
}
