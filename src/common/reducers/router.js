import { routerStateReducer } from 'redux-router';

import { inBrowser } from '../util/common';

let ReactGA;
if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

function logAnalytics(action) {
  if (inBrowser()) {
    if (action.type === '@@reduxReactRouter/routerDidChange') {
      const pathname = action.payload.location.pathname;
      console.log(pathname);
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  }
}

function routerReducer(state = null, action) {
  logAnalytics(action);
  return routerStateReducer(state, action);
}

export default routerReducer;
