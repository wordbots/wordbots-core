import * as Enzyme from 'enzyme';
import * as EnzymeAdapter from 'enzyme-adapter-react-16';

interface Global {
  requestAnimationFrame: (callback: () => void) => void
}
declare const global: Global;

// See https://reactjs.org/docs/javascript-environment-requirements.html
global.requestAnimationFrame = (callback: () => void) => {
  setTimeout(callback, 0);
};

// See Installation https://github.com/airbnb/enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() });

// See https://github.com/akiran/react-slick/issues/742
window.matchMedia = window.matchMedia || (() => ({
  matches : false,
  addListener : () => undefined,
  removeListener: () => undefined
}));
