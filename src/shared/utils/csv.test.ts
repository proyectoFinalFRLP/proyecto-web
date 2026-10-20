import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadCsv, toCsv } from './csv'

describe('toCsv', () => {
  it('separates the cells with commas and the rows with CRLF', () => {
    expect(
      toCsv([
        ['SKU', 'Unidades'],
        ['CAB-6', 40],
      ]),
    ).toBe('SKU,Unidades\r\nCAB-6,40')
  })

  it('quotes a cell with a comma, a quote or a line break, doubling the quotes', () => {
    expect(toCsv([['Caja, x 10', 'Cable "UTP"', 'dos\nlíneas']])).toBe(
      '"Caja, x 10","Cable ""UTP""","dos\nlíneas"',
    )
  })

  // Los números son para hacer cuentas: «1.200,50» sería texto para la planilla.
  it('writes numbers raw, with a dot as the decimal mark', () => {
    expect(toCsv([[1200.5, -3.2, 0]])).toBe('1200.5,-3.2,0')
  })

  it('leaves empty what has no value, instead of writing null', () => {
    expect(toCsv([['a', null, undefined, Number.NaN]])).toBe('a,,,')
  })

  // Un nombre cargado en un formulario no se puede ejecutar al abrir el archivo.
  it('escapes a text that the spreadsheet would run as a formula', () => {
    expect(toCsv([['=HYPERLINK("x")', '+54', '@foo']])).toBe(`"'=HYPERLINK(""x"")",'+54,'@foo`)
  })
})

describe('downloadCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Sin el BOM, Excel lee el archivo como Windows-1252 y «Depósito» sale roto.
  it('downloads a UTF-8 file that starts with the BOM, under the name it was given', async () => {
    const blobs: Blob[] = []
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob)
      return 'blob:csv'
    })
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('reporte.csv')
      expect(this.href).toBe('blob:csv')
    })

    downloadCsv('reporte.csv', [['Depósito'], ['Central']])

    expect(click).toHaveBeenCalledTimes(1)
    expect(blobs[0].type).toBe('text/csv;charset=utf-8')
    const bytes = new Uint8Array(await blobs[0].arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(new TextDecoder().decode(bytes.slice(3))).toBe('Depósito\r\nCentral\r\n')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv')
  })
})
