import { Table, TableBody, TableHead, TableRow, Typography } from '@mui/material'
import { StatusBadge } from 'shared/components'

import { inventoryCopy } from '../../content'

import {
  BodyCell,
  BodyRow,
  CardFooter,
  CardHeader,
  DistributionCard,
  EmptyState,
  HeadCell,
  MutedNumberCell,
  StrongNumberCell,
  TableScroll,
  WarehouseCell,
  WarehouseLocation,
  WarehouseName,
} from './WarehouseDistributionCard.styles'
import type { WarehouseDistributionCardProps } from './WarehouseDistributionCard.types'

const distributionCopy = inventoryCopy.detail.distribution
const { columns } = distributionCopy

/**
 * Tarjeta "Distribución por depósito" de S12.
 *
 * Se renderiza como `<table>` y no como la grilla de divs del diseño: son datos
 * tabulares y el lector de pantalla necesita el encabezado de cada columna para
 * poder anunciar cada celda. El diseño manda la forma, no el marcado.
 *
 * El diseño lleva además un enlace "Ver todos" en la cabecera. Acá la tabla ya
 * muestra todas las posiciones del producto, así que el enlace no tendría a
 * dónde ir.
 */
export function WarehouseDistributionCard({ rows, footnote }: WarehouseDistributionCardProps) {
  return (
    <DistributionCard>
      <CardHeader>
        <Typography variant="h3" component="h2">
          {distributionCopy.title}
        </Typography>
      </CardHeader>

      {rows.length === 0 ? (
        <EmptyState>
          <Typography variant="bodyMd" color="text.secondary">
            {distributionCopy.empty}
          </Typography>
        </EmptyState>
      ) : (
        <TableScroll>
          <Table size="small">
            <TableHead>
              <TableRow>
                <HeadCell scope="col">{columns.warehouse}</HeadCell>
                <HeadCell scope="col" align="right">
                  {columns.committed}
                </HeadCell>
                <HeadCell scope="col" align="right">
                  {columns.inTransit}
                </HeadCell>
                <HeadCell scope="col" align="right">
                  {columns.onHand}
                </HeadCell>
                <HeadCell scope="col">{columns.status}</HeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <BodyRow key={row.id} critical={Boolean(row.critical)}>
                  <WarehouseCell component="th" scope="row">
                    <WarehouseName variant="bodyMd">{row.name}</WarehouseName>
                    <WarehouseLocation variant="labelSm">{row.location}</WarehouseLocation>
                  </WarehouseCell>
                  <MutedNumberCell align="right">{row.committed}</MutedNumberCell>
                  <MutedNumberCell align="right">{row.inTransit}</MutedNumberCell>
                  <StrongNumberCell align="right">{row.onHand}</StrongNumberCell>
                  <BodyCell>
                    <StatusBadge status={row.statusVariant} label={row.statusLabel} />
                  </BodyCell>
                </BodyRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      )}

      <CardFooter>
        <Typography variant="labelMd" color="text.secondary">
          {distributionCopy.footer(rows.length)}
        </Typography>
        {footnote === undefined ? null : (
          <Typography variant="labelSm" color="text.secondary" sx={{ marginLeft: 'auto' }}>
            {footnote}
          </Typography>
        )}
      </CardFooter>
    </DistributionCard>
  )
}
