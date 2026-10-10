import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@mui/material'
import { useId } from 'react'

import { ordersCopy } from '../../content'

import { MissingHint, NextRoot } from './WizardNextButton.styles'
import type { WizardNextButtonProps } from './WizardNextButton.types'

const { wizard } = ordersCopy

/**
 * «Siguiente» de los pasos 1 y 2 del alta manual, con lo que falta para
 * avanzar debajo mientras está apagado (TESIS-173).
 *
 * Antes el botón quedaba gris y nada decía por qué: en una demo, el documento
 * vacío o el depósito sin elegir se descubrían probando. Cada página arma la
 * lista con las mismas reglas que le apagan el botón (los schemas, las líneas,
 * el depósito), así que no puede decir que falta algo que ya está.
 *
 * El texto es la descripción accesible del botón (`aria-describedby`): quien
 * llega con el teclado o el lector de pantalla oye por qué está deshabilitado
 * sin tener que ir a buscarlo.
 */
export function WizardNextButton({ label, gaps, disabled, onClick }: WizardNextButtonProps) {
  const hintId = useId()
  // Sólo con el botón apagado: un paso que ya puede avanzar no tiene nada que
  // explicar, aunque la lista llegue un render tarde respecto de `disabled`.
  const showHint = disabled && gaps.length > 0

  return (
    <NextRoot>
      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        disabled={disabled}
        onClick={onClick}
        aria-describedby={showHint ? hintId : undefined}
      >
        {label}
      </Button>
      {showHint ? (
        <MissingHint id={hintId} variant="labelSm">
          {wizard.missing(gaps)}
        </MissingHint>
      ) : null}
    </NextRoot>
  )
}
