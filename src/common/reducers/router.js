import { routerStateReducer } from 'redux-router';

import { inBrowser } from '../util/common';

let ReactGA;
if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

// Custom router reducer logs routerDidChange actions to Google Analytics,
// but otherwise defers to routerStateReducer.
function routerReducer(state = null, action) {
  if (inBrowser()) {
    if (action.type === '@@reduxReactRouter/routerDidChange') {
      const pathname = action.payload.location.pathname;
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  }

  return routerStateReducer(state, action);
}

export default routerReducer;
