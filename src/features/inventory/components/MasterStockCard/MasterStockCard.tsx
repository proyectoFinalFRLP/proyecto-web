import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Button, Typography } from '@mui/material'

import { inventoryCopy } from '../../content'

import {
  BucketLabel,
  BucketList,
  BucketRow,
  BucketValue,
  CardFooter,
  CardHeading,
  StockCard,
  TotalRow,
  TotalValue,
} from './MasterStockCard.styles'
import type { MasterStockCardProps } from './MasterStockCard.types'

const masterCopy = inventoryCopy.detail.master

/**
 * Tarjeta "Stock maestro" de S12: el agregado de todos los depósitos y su
 * desglose por estado de reserva.
 *
 * El diseño lleva además una barra de capacidad ("71 % del umbral máximo").
 * No se dibuja: `products` no tiene umbral máximo y un porcentaje contra un
 * techo inventado no es un dato — ver `utils/stock.ts`.
 */
export function MasterStockCard({
  totalLabel,
  caption,
  buckets,
  footnote,
  onEditStock,
}: MasterStockCardProps) {
  return (
    <StockCard>
      <CardHeading>
        <Typography variant="h3" component="h2">
          {masterCopy.title}
        </Typography>
        <Typography variant="bodyMd" color="text.secondary">
          {masterCopy.subtitle}
        </Typography>
      </CardHeading>

      <TotalRow>
        <TotalValue variant="displayLg" component="p">
          {totalLabel}
        </TotalValue>
        <Typography variant="bodyMd" color="text.secondary">
          {masterCopy.units}
        </Typography>
      </TotalRow>

      <Typography variant="labelSm" color="text.secondary">
        {caption}
      </Typography>

      <BucketList>
        {buckets.map((bucket) => {
          const emphasis = Boolean(bucket.accent) && !bucket.unknown

          return (
            <BucketRow key={bucket.id} accent={Boolean(bucket.accent)}>
              {bucket.icon}
              <BucketLabel variant="bodyMd" emphasis={emphasis}>
                {bucket.label}
              </BucketLabel>
              <BucketValue variant="dataMono" emphasis={emphasis}>
                {bucket.value}
              </BucketValue>
            </BucketRow>
          )
        })}
      </BucketList>

      {footnote === undefined ? null : (
        <Typography variant="labelSm" color="text.secondary">
          {footnote}
        </Typography>
      )}

      <CardFooter>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          onClick={onEditStock}
        >
          {masterCopy.edit}
        </Button>
      </CardFooter>
    </StockCard>
  )
}
