class Hex {
  constructor(q, r, s, props = {}) {
    this.q = q;
    this.r = r;
    this.s = s;
    this.props = props;
  }

  equals(otherHex) {
    return (
      this.q === otherHex.q &&
      this.r === otherHex.r &&
      this.s === otherHex.s
    );
  }

  distance(otherHex) {
    return Math.max(
        Math.abs(this.q - otherHex.q),
        Math.abs(this.r - otherHex.r),
        Math.abs(this.s - otherHex.s)
    );
  }

  isInArray(hexArray) {
    for (let i = 0; i < hexArray.length; i++) {
      if (this.equals(hexArray[i])) {
        return true;
      }
    }
  }
}

export default Hex;
