import { createStore, applyMiddleware, compose } from 'redux';
import multi from 'redux-multi';
import thunk from 'redux-thunk';

import promiseMiddleware from '../api/promiseMiddleware';
import createSocketMiddleware from '../api/socketMiddleware';
import rootReducer from '../reducers';
import * as actions from '../actions/game';

import { loadState, saveState } from './persistState';

const middlewareBuilder = () => {
  const universalMiddleware = [thunk, promiseMiddleware, multi];

  let middleware = {};
  let allComposeElements = [];

  if (process.browser) {
    const ignoredActions = [actions.SET_HOVERED_CARD, actions.SET_HOVERED_TILE];

    const socketMiddleware = createSocketMiddleware({
      excludedActions: ignoredActions
    });

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
      middleware = applyMiddleware(...universalMiddleware, socketMiddleware);
      allComposeElements = [middleware];
    } else {
      const createLogger = require('redux-logger').createLogger;
      const DevTools = require('../containers/DevTools').default;

      const logger = createLogger({
        predicate: (getState, action) => !ignoredActions.includes(action.type)
      });

      middleware = applyMiddleware(...universalMiddleware, socketMiddleware, logger);
      allComposeElements = [
        middleware,
        DevTools.instrument()
      ];
    }
  } else {
    middleware = applyMiddleware(...universalMiddleware);
    allComposeElements = [middleware];
  }

  return allComposeElements;

};

const finalCreateStore = compose(...middlewareBuilder())(createStore);

export default function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, loadState(initialState));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  store.subscribe(() => { saveState(store.getState()); });

  return store;
}
