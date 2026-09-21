import { describe, expect, it } from 'vitest'

import { areaPath, axisTicks, linePath, niceCeiling, plotPoints, tickOffsets } from './chart'
import type { ChartFrame } from './chart'

// Un lienzo chico con números redondos, para leer las coordenadas a ojo.
const FRAME: ChartFrame = { width: 100, height: 60, inset: 5 }

describe('niceCeiling', () => {
  it('rounds the maximum up to the next 1, 2, 4 or 10 of its magnitude', () => {
    expect(niceCeiling([2400, 9400])).toBe(10_000)
    expect(niceCeiling([380_000, 740_000])).toBe(1_000_000)
    expect(niceCeiling([15])).toBe(20)
    expect(niceCeiling([30])).toBe(40)
  })

  it('keeps a maximum that is already round', () => {
    expect(niceCeiling([10_000])).toBe(10_000)
    expect(niceCeiling([200])).toBe(200)
  })

  // Sin magnitud de la que partir el eje se dibuja igual, de 0 a 10.
  it('falls back to a fixed axis for an empty or all-zero series', () => {
    expect(niceCeiling([])).toBe(10)
    expect(niceCeiling([0, 0])).toBe(10)
  })
})

describe('axisTicks', () => {
  it('lists five values from the ceiling down to zero', () => {
    expect(axisTicks(10_000)).toEqual([10_000, 7_500, 5_000, 2_500, 0])
  })
})

describe('tickOffsets', () => {
  it('spreads the ticks evenly inside the vertical inset', () => {
    expect(tickOffsets(FRAME)).toEqual([5, 17.5, 30, 42.5, 55])
  })
})

describe('plotPoints', () => {
  it('spreads the values across the full width, first at 0 and last at the edge', () => {
    const points = plotPoints([0, 0, 0], 10, FRAME)

    expect(points.map((point) => point.x)).toEqual([0, 50, 100])
  })

  // En SVG el 0 está arriba: el techo va al margen superior y el 0 al inferior.
  it('maps the ceiling to the top inset and zero to the bottom inset', () => {
    const [top, bottom] = plotPoints([10, 0], 10, FRAME)

    expect(top.y).toBe(5)
    expect(bottom.y).toBe(55)
  })

  it('puts a middle value halfway', () => {
    const [point] = plotPoints([5], 10, FRAME)

    expect(point.y).toBe(30)
  })

  it('never draws above the ceiling or below zero', () => {
    const [above, below] = plotPoints([20, -3], 10, FRAME)

    expect(above.y).toBe(5)
    expect(below.y).toBe(55)
  })

  it('leaves a single value at the left edge instead of dividing by zero', () => {
    const [point] = plotPoints([4], 10, FRAME)

    expect(point.x).toBe(0)
  })
})

describe('linePath', () => {
  it('draws nothing with fewer than two points', () => {
    expect(linePath([])).toBe('')
    expect(linePath([{ x: 0, y: 0 }])).toBe('')
  })

  it('starts at the first point and passes through every other one', () => {
    const path = linePath([
      { x: 0, y: 50 },
      { x: 50, y: 10 },
      { x: 100, y: 30 },
    ])

    expect(path.startsWith('M0,50 ')).toBe(true)
    // Cada tramo `C` termina exactamente en el punto que le toca.
    expect(path).toMatch(/ 50,10 C/)
    expect(path.endsWith(' 100,30')).toBe(true)
  })

  it('draws one cubic segment per pair of consecutive points', () => {
    const path = linePath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 30, y: 10 },
    ])

    expect(path.match(/C/g)).toHaveLength(3)
  })
})

describe('areaPath', () => {
  it('closes the line against the floor of the frame', () => {
    const path = areaPath(
      [
        { x: 0, y: 50 },
        { x: 100, y: 10 },
      ],
      FRAME,
    )

    expect(path.endsWith(' L100,60 L0,60 Z')).toBe(true)
  })

  it('is empty when there is no line to close', () => {
    expect(areaPath([{ x: 0, y: 0 }], FRAME)).toBe('')
  })
})
