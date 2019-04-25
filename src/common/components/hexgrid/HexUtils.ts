import { BOARD_SIZE_MULTIPLIER } from '../../constants';
import { HexId } from '../../types';

import Hex from './Hex';
import Layout from './Layout';
import Point from './Point';

class HexUtils {
  public static DIRECTIONS: Hex[] = [
    new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1),
    new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)
  ];

  public static add(a: Hex, b: Hex): Hex {
    return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
  }

  public static subtract(a: Hex, b: Hex): Hex {
    return HexUtils.add(a, HexUtils.multiply(b, -1));
  }

  public static multiply(a: Hex, k: number): Hex {
    return new Hex(a.q * k, a.r * k, a.s * k);
  }

  public static lengths(hex: Hex): number {
    return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
  }

  public static distance(a: Hex, b: Hex): number {
    return HexUtils.lengths(HexUtils.subtract(a, b));
  }

  public static direction(direction: number): Hex {
    return HexUtils.DIRECTIONS[(6 + (direction % 6)) % 6];
  }
  public static neighbour(hex: Hex, direction: number): Hex {
    return HexUtils.add(hex, HexUtils.direction(direction));
  }

  public static round(hex: Hex): Hex {
    let rq = Math.round(hex.q);
    let rr = Math.round(hex.r);
    let rs = Math.round(hex.s);

    const qDiff = Math.abs(rq - hex.q);
    const rDiff = Math.abs(rr - hex.r);
    const sDiff = Math.abs(rs - hex.s);

    if (qDiff > rDiff && qDiff > rDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    } else {
      rs = -rq - rr;
    }

    return new Hex(rq, rr, rs);
  }

  public static hexToPixel(hex: Hex, layout: Layout): Point {
    const s = layout.spacing;
    const M = layout.orientation;
    let x = (M.f0 * hex.q + M.f1 * hex.r) * layout.size.x;
    let y = (M.f2 * hex.q + M.f3 * hex.r) * layout.size.y;
    // Apply spacing
    x = x * s;
    y = y * s;
    return new Point((x + layout.origin.x) * BOARD_SIZE_MULTIPLIER, (y + layout.origin.y) * BOARD_SIZE_MULTIPLIER);
  }

  public static pixelToHex(point: Point, layout: Layout): Hex {
    const M = layout.orientation;
    const pt = new Point((point.x - layout.origin.x) / layout.size.x, (point.y - layout.origin.y) / layout.size.y);
    const q = M.b0 * pt.x + M.b1 * pt.y;
    const r = M.b2 * pt.x + M.b3 * pt.y;
    return new Hex(q, r, -q - r);
  }

  public static lerp(a: Hex, b: Hex, t: number): Hex {
    return new Hex(a.q + (b.q - a.q) * t, a.r + (b.r - a.r) * t, a.s + (b.s - a.s) * t);
  }

  public static getID(hex: Hex): HexId {
    return `${hex.q},${hex.r},${hex.s}`;
  }

  public static IDToHex(hexId: HexId): Hex {
    const coords: number[] = hexId.split(',').map((coord) => parseInt(coord, 10));

    if (coords.length === 3) {
      return new Hex(coords[0], coords[1], coords[2]);
    } else {
      throw new Error(`Invalid hex ID: ${hexId}`);
    }
  }

  public static coordsToID(q: number, r: number, s: number): HexId {
    return `${q},${r},${s}`;
  }
}

export default HexUtils;
