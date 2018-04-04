import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

/* eslint-disable no-console */
// console.warn = jest.genMockFn();
/* eslint-enable no-console */

// See https://reactjs.org/docs/javascript-environment-requirements.html
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

// See Installation https://github.com/airbnb/enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() });
