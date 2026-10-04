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
 * El diseño dibuja acá un porcentaje de ocupación. Desde TESIS-162 el depósito
 * puede declarar su capacidad, así que el de los que la declararon es real: la
 * barra mide cuánto de lo que entra está ocupado, y la fila lo dice.
 *
 * El de los que no la declararon sigue sin existir, y ahí la barra compara los
 * depósitos entre sí —el 100 % es el más cargado—, que es la única comparación
 * real que queda. Un porcentaje de ocupación sin techo sería inventado.
 *
 * Por eso todas las barras van en el mismo tono: no codifican riesgo, y lo que
 * cada una mide lo dice su fila y su rótulo accesible.
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
                  <StoredUnits variant="labelSm">
                    {warehouse.measuredAgainstCapacity
                      ? copy.occupancy(warehouse.share)
                      : copy.units(warehouse.storedUnits)}
                  </StoredUnits>
                </RowHeader>
                <ProgressIndicator
                  value={warehouse.share}
                  size="medium"
                  track="neutral"
                  ariaLabel={
                    warehouse.capacity === null
                      ? copy.barLabel(warehouse.name, warehouse.storedUnits)
                      : copy.barLabelWithCapacity(
                          warehouse.name,
                          warehouse.storedUnits,
                          warehouse.capacity,
                        )
                  }
                />
              </Row>
            ))}
          </Rows>
        </>
      )}
    </LoadCard>
  )
}
