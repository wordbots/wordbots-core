/* eslint-disable no-console */
console.warn = jest.genMockFn();
/* eslint-enable no-console */

// See https://reactjs.org/docs/javascript-environment-requirements.html
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
