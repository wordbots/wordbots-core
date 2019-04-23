import { BOARD_SIZE_MULTIPLIER } from '../../constants';

import Hex from './Hex';
import Point from './Point';
import { LayoutParams } from './types';

class Orientation {
  public f0: number;
  public f1: number;
  public f2: number;
  public f3: number;
  public b0: number;
  public b1: number;
  public b2: number;
  public b3: number;
  public startAngle: number;

  constructor(f0: number, f1: number, f2: number, f3: number, b0: number, b1: number, b2: number, b3: number, startAngle: number) {
    this.f0 = f0;
    this.f1 = f1;
    this.f2 = f2;
    this.f3 = f3;
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
    this.b3 = b3;
    this.startAngle = startAngle;
  }
}

class Layout {
  public static LAYOUT_FLAT = new Orientation(3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3), 2 / 3, 0, -1 / 3, Math.sqrt(3) / 3, 0);
  public static LAYOUT_POINTY = new Orientation(Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2, Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3, 0.5);

  public orientation: Orientation;
  public size: Point;
  public origin: Point;
  public spacing: number;

  constructor(layout: LayoutParams, origin: Point) {
    this.orientation = (layout.flat) ? Layout.LAYOUT_FLAT : Layout.LAYOUT_POINTY;
    this.size = new Point(layout.width, layout.height);
    this.origin = origin || new Point(0, 0);
    this.spacing = layout.spacing || 1;
  }

  public getPointOffset(corner: number): Point {
    const angle = 2 * Math.PI * (corner + this.orientation.startAngle) / 6;
    return new Point((this.size.x * BOARD_SIZE_MULTIPLIER) * Math.cos(angle), (this.size.y * BOARD_SIZE_MULTIPLIER) * Math.sin(angle));
  }

  // TODO why does this want a hex parameter?
  public getPolygonPoints(_hex: Hex): Point[] {
    const corners: Point[] = [];
    const center: Point = new Point(0, 0);

    Array.from(new Array(6), (_x, i) => {
      const offset = this.getPointOffset(i);
      const point = new Point(center.x + offset.x, center.y + offset.y);
      corners.push(point);
    });

    return corners;
  }
}

export default Layout;
