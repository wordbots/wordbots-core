import { withoutEmptyFields } from '../../src/common/util/common';

describe('withoutEmptyFields', () => {
  it('should remove undefined fields recursively', () => {
    const obj = { a: 1, b: 2, c: undefined, d: { e: 3, f: undefined, g: null } };
    expect(withoutEmptyFields(obj)).toEqual({ a: 1, b: 2, d: { e: 3, g: null }});
  });
});
