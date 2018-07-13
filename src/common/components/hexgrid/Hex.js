import { some } from 'lodash';

import { compareCertainKeys } from '../../util/common.ts';

class Hex {
  constructor(q, r, s, props = {}) {
    this.q = q;
    this.r = r;
    this.s = s;
    this.props = props;
  }

  equals(otherHex) {
    return compareCertainKeys(this, otherHex, ['q', 'r', 's']);
  }

  distance(otherHex) {
    return Math.max(
        Math.abs(this.q - otherHex.q),
        Math.abs(this.r - otherHex.r),
        Math.abs(this.s - otherHex.s)
    );
  }

  isInArray(hexArray) {
    return some(hexArray, hex => this.equals(hex));
  }
}

export default Hex;
