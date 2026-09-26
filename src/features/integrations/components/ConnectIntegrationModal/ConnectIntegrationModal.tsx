import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Divider, TextField, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { IntegrationFieldSpec } from 'shared/api'
import {
  LabeledField,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalForm,
  ModalFrame,
} from 'shared/components'

import { integrationsCopy } from '../../content'
import {
  buildConnectionSchema,
  defaultConnectionValues,
  toConnectionPayload,
  toFormFieldErrors,
} from '../../utils/connectionForm'
import type { ConnectionFormValues } from '../../utils/connectionForm'

import { FieldSection } from './ConnectIntegrationModal.styles'
import type { ConnectIntegrationModalProps } from './ConnectIntegrationModal.types'

const { modal: copy } = integrationsCopy

const OAUTH_CLIENT_CREDENTIALS = 'oauth_client_credentials'

/**
 * Formulario de conexión de un proveedor. No tiene campos propios: los arma con
 * lo que declara la plantilla, así que un dato nuevo que el proveedor pida
 * (cargado desde el backoffice) aparece acá sin tocar código.
 *
 * Presentacional: entrega el cuerpo listo para `PUT /integrations/:id` y muestra
 * los errores por campo que devuelve la API.
 */
export function ConnectIntegrationModal({
  service,
  submitting = false,
  submitError,
  onSubmit,
  onClose,
}: ConnectIntegrationModalProps) {
  const schema = useMemo(() => (service ? buildConnectionSchema(service) : null), [service])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ConnectionFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: service ? defaultConnectionValues(service) : undefined,
  })

  // Cada apertura arranca con lo que tiene guardado ese proveedor.
  useEffect(() => {
    if (service) reset(defaultConnectionValues(service))
  }, [service, reset])

  const fieldErrors = useMemo(() => toFormFieldErrors(submitError?.fields), [submitError])

  // El 422 no cierra el modal: cada error va a su input, para corregirlo ahí.
  useEffect(() => {
    fieldErrors.forEach(({ name, message }) => setError(name, { message }))
  }, [fieldErrors, setError])

  if (!service) return null

  // Un rechazo sin campos (un 403, un 500) no se sabe a qué input pertenece.
  const generalError = submitError && fieldErrors.length === 0 ? submitError.message : undefined
  const hasFields = service.credentialFields.length + service.settingFields.length > 0

  const renderField = (scope: 'credentials' | 'settings', field: IntegrationFieldSpec) => {
    const name = `${scope}.${field.key}` as const
    const message = errors[scope]?.[field.key]?.message
    const loaded = scope === 'credentials' && service.credentialsSet.includes(field.key)
    const required = field.required && !loaded

    return (
      <LabeledField
        key={name}
        label={field.label}
        error={message}
        helperText={loaded ? copy.secretLoaded : undefined}
        fullWidth
      >
        <TextField
          {...register(name)}
          type={scope === 'credentials' ? 'password' : 'text'}
          autoComplete="off"
          error={message !== undefined}
          required={required}
          fullWidth
        />
      </LabeledField>
    )
  }

  return (
    <ModalFrame
      open
      title={copy.title(service.name)}
      subtitle={copy.subtitle}
      closeLabel={copy.close}
      onClose={onClose}
      busy={submitting}
    >
      <ModalForm
        onSubmit={handleSubmit((values) => onSubmit(toConnectionPayload(values)))}
        noValidate
      >
        <ModalBody>
          {generalError === undefined ? null : (
            <Alert severity="error" variant="outlined">
              {generalError}
            </Alert>
          )}

          {service.authStrategy === OAUTH_CLIENT_CREDENTIALS ? (
            <Alert severity="info" variant="outlined">
              {copy.oauthHint}
            </Alert>
          ) : null}

          {hasFields ? null : <Typography variant="bodyMd">{copy.noFields}</Typography>}

          {service.settingFields.length > 0 ? (
            <FieldSection>
              <Typography variant="labelSm" color="text.secondary">
                {copy.settings}
              </Typography>
              {service.settingFields.map((field) => renderField('settings', field))}
            </FieldSection>
          ) : null}

          {service.settingFields.length > 0 && service.credentialFields.length > 0 ? (
            <Divider />
          ) : null}

          {service.credentialFields.length > 0 ? (
            <FieldSection>
              <Typography variant="labelSm" color="text.secondary">
                {copy.credentials}
              </Typography>
              {service.credentialFields.map((field) => renderField('credentials', field))}
            </FieldSection>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <ModalFooterActions>
            <Button color="neutral" variant="text" onClick={onClose} disabled={submitting}>
              {copy.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? copy.saving : copy.save}
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </ModalForm>
    </ModalFrame>
  )
}
