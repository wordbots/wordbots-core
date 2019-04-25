import { some } from 'lodash';

class Hex {
  public q: number;
  public r: number;
  public s: number;

  constructor(q: number, r: number, s: number) {
    this.q = q;
    this.r = r;
    this.s = s;
  }

  public equals(other: Hex): boolean {
    return this.q === other.q && this.r === other.r && this.s === other.s;
  }

  public distance(other: Hex): number {
    return Math.max(
        Math.abs(this.q - other.q),
        Math.abs(this.r - other.r),
        Math.abs(this.s - other.s)
    );
  }

  public isInArray(hexArray: Hex[]): boolean {
    return some(hexArray, this.equals);
  }
}

export default Hex;
