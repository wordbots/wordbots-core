import * as w from '../../types';

import Hex from './Hex';

class GridGenerator {
  public static getGenerator(name: string): w.Returns<Hex[]> | null {
    if (name in GridGenerator) {
      return (GridGenerator as any)[name];
    }

    return null;
  }

  public static hexagon(mapRadius: number): Hex[] {
    const hexas = [];
    for (let q = -mapRadius; q <= mapRadius; q++) {
      const r1 = Math.max(-mapRadius, -q - mapRadius);
      const r2 = Math.min(mapRadius, -q + mapRadius);
      for (let r = r1; r <= r2; r++) {
        hexas.push(new Hex(q, r, -q - r));
      }
    }

    return hexas;
  }

  // @ts-ignore
  private static parallelogram(q1: number, q2: number, r1: number, r2: number): Hex[] {
    const hexas = [];
    for (let q = q1; q <= q2; q++) {
      for (let r = r1; r <= r2; r++) {
        hexas.push(new Hex(q, r, -q - r));
      }
    }

    return hexas;
  }

  // @ts-ignore
  private static triangle(mapSize: number): Hex[] {
    const hexas = [];
    for (let q = 0; q <= mapSize; q++) {
      for (let r = 0; r <= mapSize - q; r++) {
        hexas.push(new Hex(q, r, -q - r));
      }
    }

    return hexas;
  }

  // @ts-ignore
  private static rectangle(mapWidth: number, mapHeight: number): Hex[] {
    const hexas = [];
    for (let r = 0; r < mapHeight; r++) {
      const offset = Math.floor(r / 2); // or r>>1
      for (let q = -offset; q < mapWidth - offset; q++) {
        hexas.push(new Hex(q, r, -q - r));
      }
    }

    return hexas;
  }

  // @ts-ignore
  private static orientedRectangle(mapWidth: number, mapHeight: number): Hex[] {
    const hexas = [];
    for (let q = 0; q < mapWidth; q++) {
      const offset = Math.floor(q / 2); // or q>>1
      for (let r = -offset; r < mapHeight - offset; r++) {
        hexas.push(new Hex(q, r, -q - r));
      }
    }

    return hexas;
  }

}

export default GridGenerator;
