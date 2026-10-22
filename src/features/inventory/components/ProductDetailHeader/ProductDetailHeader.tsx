import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { StatusBadge } from 'shared/components'

import { inventoryCopy } from '../../content'

import {
  Actions,
  CurrentCrumb,
  Crumbs,
  SkuTitle,
  TitleGroup,
  TitleLine,
  TitleRow,
} from './ProductDetailHeader.styles'
import type { ProductDetailHeaderProps } from './ProductDetailHeader.types'

const { breadcrumb, actions } = inventoryCopy.detail

/**
 * Encabezado de S12: ruta de navegación, identidad del producto y las dos
 * acciones de la pantalla.
 *
 * Presentacional — el estado de disponibilidad llega ya resuelto en props, como
 * el resto de los componentes del feature.
 */
export function ProductDetailHeader({
  sku,
  name,
  statusLabel,
  statusVariant,
  catalogPath,
  onEdit,
  onExport,
}: ProductDetailHeaderProps) {
  return (
    <Box>
      <Crumbs
        aria-label={breadcrumb.label}
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link to={catalogPath}>{breadcrumb.inventory}</Link>
        <Link to={catalogPath}>{breadcrumb.catalog}</Link>
        {/* Último tramo: no es un enlace — es dónde estamos parados. */}
        <CurrentCrumb aria-current="page">{sku}</CurrentCrumb>
      </Crumbs>

      <TitleRow>
        <TitleGroup>
          <TitleLine>
            <SkuTitle variant="h1" component="h1">
              {sku}
            </SkuTitle>
            <StatusBadge status={statusVariant} label={statusLabel} size="lg" />
          </TitleLine>
          <Typography variant="bodyMd" color="text.secondary">
            {name}
          </Typography>
        </TitleGroup>

        <Actions>
          <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={onExport}>
            {actions.export}
          </Button>
          <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
            {actions.edit}
          </Button>
        </Actions>
      </TitleRow>
    </Box>
  )
}
