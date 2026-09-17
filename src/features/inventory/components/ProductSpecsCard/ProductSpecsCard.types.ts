/** Una celda de la cuadrícula de especificaciones: rótulo arriba, valor abajo. */
export interface ProductSpec {
  /** Clave estable de la lista — nunca el índice (`react/no-array-index-key`). */
  id: string
  label: string
  value: string
  /** Familia monoespaciada para los valores numéricos, como en el diseño. */
  mono?: boolean
  /** El dato no está disponible: se atenúa y se anuncia como tal. */
  unknown?: boolean
}

export interface ProductSpecsCardProps {
  /** Cuadrícula principal (categoría, peso, dimensiones, empaque). */
  specs: ProductSpec[]
  /** Fila de abajo del divisor (norma técnica, última actualización). */
  secondarySpecs: ProductSpec[]
  /** Aclaración al pie, para los campos que la API todavía no expone. */
  footnote?: string
}
