import AddIcon from '@mui/icons-material/Add'
import { Autocomplete, Button, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { formatCount, ordersCopy } from '../../content'
import type { CatalogProduct } from '../../types'
import { isDraftItemValid } from '../../utils/draft'

import { OptionBody, PickerForm, PriceSlot, QuantitySlot, SearchSlot } from './ProductPicker.styles'
import type { ProductPickerProps } from './ProductPicker.types'

const { products: copy } = ordersCopy.draft

// Sin precio de lista que cargar (`products` no tiene esa columna), el precio
// arranca vacío y la cantidad en una unidad, que es la venta más común.
const INITIAL_QUANTITY = '1'
const INITIAL_PRICE = ''

// Cantidad y precio en la monoespaciada del DS, como cualquier número de la
// pantalla. Va en el root del input: el `<input>` hereda la fuente.
const MONO = { typography: 'dataMono' }

/**
 * Barra para sumar un SKU a la orden: buscador sobre el catálogo, cantidad y
 * precio unitario. «Agregar» se habilita recién cuando los tres son válidos.
 *
 * Es un `<form>` propio para que Enter en el precio agregue la línea, y no
 * usa React Hook Form a propósito: la única regla es `isDraftItemValid`, la
 * misma que valida las filas ya cargadas, y así vive en un solo lugar en vez
 * de repetirse en un schema.
 */
export function ProductPicker({
  products,
  loading = false,
  addedIds,
  onSearchChange,
  onAdd,
}: ProductPickerProps) {
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [quantity, setQuantity] = useState(INITIAL_QUANTITY)
  const [unitPrice, setUnitPrice] = useState(INITIAL_PRICE)

  // Un campo vacío da `Number('') === 0`, que las reglas rechazan igual que un
  // cero tipeado: no hace falta distinguirlos.
  const candidate = { quantity: Number(quantity), unitPrice: Number(unitPrice) }
  const canAdd = product !== null && isDraftItemValid(candidate)

  function add() {
    if (product === null || !canAdd) return

    onAdd({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      weight: product.weight,
      ...candidate,
    })
    // Lista para el siguiente SKU: el foco queda en el buscador porque el
    // usuario va a tipear otro.
    // El buscador se vacía solo: al volver `product` a null, MUI limpia el
    // campo y avisa con un valor vacío, que `onInputChange` sí propaga.
    setProduct(null)
    setQuantity(INITIAL_QUANTITY)
    setUnitPrice(INITIAL_PRICE)
  }

  return (
    <PickerForm
      onSubmit={(event) => {
        event.preventDefault()
        add()
      }}
    >
      <SearchSlot>
        <Autocomplete
          options={products}
          value={product}
          onChange={(_event, value) => setProduct(value)}
          // Sólo lo que la persona tipea es una búsqueda. Al elegir una opción
          // MUI escribe su etiqueta en el campo y avisa con `reason: 'reset'`:
          // si eso viajara al backend —y viajaba— se pediría el catálogo por
          // «PX-9021-LRG · Router industrial…», que no matchea ni por SKU ni
          // por nombre, y la lista quedaría vacía la próxima vez que se abra el
          // buscador.
          //
          // `value === ''` sí se propaga: es la cruz de borrar y el reinicio
          // que hace MUI cuando la línea se agrega y el producto vuelve a null.
          onInputChange={(_event, value, reason) => {
            if (reason === 'input' || value === '') onSearchChange(value)
          }}
          // Las opciones se muestran tal como llegaron: ya vienen filtradas por
          // el backend, que busca por SKU y por nombre. Filtrar de nuevo acá no
          // agregaría nada y sí quitaría: con `keepPreviousData` la lista sigue
          // mostrando las coincidencias de la búsqueda anterior mientras llega
          // la nueva, y el filtro de MUI —que compara contra lo ya tipeado— las
          // escondería tras un «Ningún producto coincide.» que dura lo que
          // tarda el request.
          filterOptions={(options) => options}
          getOptionLabel={(option) => `${option.sku} · ${option.name}`}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionDisabled={(option) => addedIds.has(option.id)}
          loading={loading}
          loadingText={copy.loadingCatalog}
          noOptionsText={copy.noMatches}
          size="small"
          autoHighlight
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <OptionBody>
                <Typography variant="bodyMd" noWrap>
                  <Typography component="span" variant="dataMono">
                    {option.sku}
                  </Typography>
                  {` · ${option.name}`}
                </Typography>
                <Typography variant="labelSm" color="text.secondary" noWrap>
                  {addedIds.has(option.id)
                    ? copy.alreadyAdded
                    : copy.optionMeta(option.category, formatCount(option.totalStock))}
                </Typography>
              </OptionBody>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={copy.searchPlaceholder}
              slotProps={{ htmlInput: { ...params.inputProps, 'aria-label': copy.searchLabel } }}
            />
          )}
        />
      </SearchSlot>

      <QuantitySlot>
        <TextField
          type="number"
          size="small"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder={copy.quantity}
          slotProps={{
            input: { sx: MONO },
            htmlInput: { min: 1, step: 1, 'aria-label': copy.quantity },
          }}
          fullWidth
        />
      </QuantitySlot>

      <PriceSlot>
        <TextField
          type="number"
          size="small"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          placeholder={copy.unitPrice}
          slotProps={{
            input: {
              sx: MONO,
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
            htmlInput: { min: 0, step: '0.01', 'aria-label': copy.unitPrice },
          }}
          fullWidth
        />
      </PriceSlot>

      <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!canAdd}>
        {copy.add}
      </Button>
    </PickerForm>
  )
}
