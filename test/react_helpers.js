import ReactTestUtils from 'react-addons-test-utils';

export function renderElement(elt) {
  const renderer = ReactTestUtils.createRenderer();
  renderer.render(elt);
  return renderer.getRenderOutput();
}
