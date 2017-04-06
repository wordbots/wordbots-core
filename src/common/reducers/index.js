import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import undoable from 'redux-undo';

import game from './game';
import creator from './creator';
import collection from './collection';
import socket from './socket';
import user from './user';
import layout from './layout';
import version from './version';

function withAnalytics(fallbackReducer) {
  if (typeof document === 'undefined' || (window.process && window.process.title.includes('node'))) {
    // Don't do any analytics stuff on the server side (it would break).
    return fallbackReducer;
  } else {
    // Initialize Google Analytics and connect to the router reducer.
    const ReactGA = require('react-ga');
    ReactGA.initialize('UA-345959-18');

    return (state = null, action) => {
      if (action.type === '@@reduxReactRouter/routerDidChange') {
        ReactGA.set({ page: action.payload.location.pathname });
        ReactGA.pageview(action.payload.location.pathname);
      }
      return fallbackReducer(state, action);
    };
  }
}

const rootReducer = combineReducers({
  game: game,
  creator: creator,
  collection: collection,
  socket: socket,
  user: user,
  version: version,
  layout: undoable(layout),
  router: withAnalytics(routerStateReducer)
});

export default rootReducer;
