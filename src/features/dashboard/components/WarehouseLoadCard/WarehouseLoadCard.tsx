import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { Typography } from '@mui/material'
import { ProgressIndicator, ProgressSkeleton } from 'shared/components'

import { dashboardCopy } from '../../content'

import {
  HeaderRow,
  LoadCard,
  Row,
  RowHeader,
  Rows,
  SKELETON_ROWS,
  StoredUnits,
  WarehouseName,
} from './WarehouseLoadCard.styles'
import type { WarehouseLoadCardProps } from './WarehouseLoadCard.types'

const copy = dashboardCopy.warehouses

/**
 * Cuánto guarda cada depósito, ordenados de más a menos cargado.
 *
 * El diseño dibuja acá un porcentaje de ocupación con tres tonos (azul, naranja,
 * rojo) según qué tan lleno está el depósito. Eso no se puede mostrar: la tabla
 * `warehouses` no tiene ninguna capacidad máxima contra la cual medir, y un
 * porcentaje inventado pondría un número sin significado en un panel cuyo
 * subtítulo promete datos en vivo.
 *
 * Lo que sí es real es cuánto guarda cada uno, así que la barra compara los
 * depósitos entre sí: el 100% es el más cargado. Por eso todas las barras van
 * en el mismo tono —no codifican riesgo, codifican proporción— y el epígrafe
 * dice contra qué se mide, para que nadie lea ocupación donde no la hay.
 *
 * Presentacional: recibe los depósitos ya ordenados y con su proporción.
 */
export function WarehouseLoadCard({
  warehouses,
  storedUnits,
  loading = false,
}: WarehouseLoadCardProps) {
  return (
    <LoadCard>
      <HeaderRow>
        <Typography variant="h3">{copy.title}</Typography>
        <WarehouseOutlinedIcon />
      </HeaderRow>

      {loading ? (
        <Rows>
          {SKELETON_ROWS.map((id) => (
            <ProgressSkeleton key={id} />
          ))}
        </Rows>
      ) : (
        <>
          <Typography variant="labelSm" color="text.secondary">
            {warehouses.length === 0 ? copy.empty : copy.caption(storedUnits)}
          </Typography>

          <Rows>
            {warehouses.map((warehouse) => (
              <Row key={warehouse.id}>
                <RowHeader>
                  <WarehouseName variant="bodyMd">{warehouse.name}</WarehouseName>
                  <StoredUnits variant="labelSm">{copy.units(warehouse.storedUnits)}</StoredUnits>
                </RowHeader>
                <ProgressIndicator
                  value={warehouse.share}
                  size="medium"
                  track="neutral"
                  ariaLabel={copy.barLabel(warehouse.name, warehouse.storedUnits)}
                />
              </Row>
            ))}
          </Rows>
        </>
      )}
    </LoadCard>
  )
}
