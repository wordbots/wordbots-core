import { createStore, applyMiddleware, compose } from 'redux';
import multi from 'redux-multi';
import { reduxReactRouter } from 'redux-router';
import thunk from 'redux-thunk';
import createHistory from 'history/lib/createBrowserHistory';
import createLogger from 'redux-logger';

import DevTools from '../containers/DevTools';
import promiseMiddleware from '../api/promiseMiddleware';
import rootReducer from '../reducers';
import * as gameActions from '../actions/game';

import { loadState, saveState } from './persistState';

const middlewareBuilder = () => {
  let middleware = {};
  const universalMiddleware = [thunk, promiseMiddleware, multi];
  let allComposeElements = [];

  if (process.browser) {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
      middleware = applyMiddleware(...universalMiddleware);
      allComposeElements = [
        middleware,
        reduxReactRouter({
          createHistory
        })
      ];
    } else {
      const logger = createLogger({
        predicate: (getState, action) => ![gameActions.SET_HOVERED_CARD, gameActions.SET_HOVERED_TILE].includes(action.type)
      });

      middleware = applyMiddleware(...universalMiddleware, logger);
      allComposeElements = [
        middleware,
        reduxReactRouter({
          createHistory
        }),
        DevTools.instrument()
      ];
    }
  } else {
    middleware = applyMiddleware(...universalMiddleware);
    allComposeElements = [
      middleware
    ];
  }

  return allComposeElements;

};

const finalCreateStore = compose(...middlewareBuilder())(createStore);

export default function configureStore(initialState) {
  const store = finalCreateStore(rootReducer, loadState(initialState));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  store.subscribe(() => { saveState(store.getState()); });

  return store;
}
