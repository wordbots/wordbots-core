import { createStore, applyMiddleware, compose } from 'redux';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import { compact } from 'lodash';

import { ALWAYS_ENABLE_DEV_TOOLS, ENABLE_REDUX_TIME_TRAVEL } from '../constants';
import promiseMiddleware from '../middleware/promiseMiddleware';
import createSocketMiddleware from '../middleware/socketMiddleware';
import rootReducer from '../reducers';
import * as socketActions from '../actions/socket';

const DEV_TOOLS_ENABLED = ALWAYS_ENABLE_DEV_TOOLS || !['production', 'test'].includes(process.env.NODE_ENV);

const selectStoreEnhancers = () => {
  const universalMiddleware = [thunk, promiseMiddleware, multi];  // Middleware that we use in every environment.

  if (process.browser) {
    const socketMiddleware = createSocketMiddleware({
      excludedActions: [socketActions.CONNECTING, socketActions.CONNECTED, socketActions.DISCONNECTED]
    });

    if (DEV_TOOLS_ENABLED) {
      const createLogger = require('redux-logger').createLogger;
      const DevTools = require('../containers/DevTools').default;

      // react-addons-perf unsupported as of React 16.0.0.
      // const Perf = require('react-addons-perf');
      // window.Perf = Perf;

      return [
        applyMiddleware(...universalMiddleware, socketMiddleware, createLogger()),
        ENABLE_REDUX_TIME_TRAVEL && DevTools.instrument()
      ];
    } else {
      return [
        applyMiddleware(...universalMiddleware, socketMiddleware)
      ];
    }
  } else {
    return [
      applyMiddleware(...universalMiddleware)
    ];
  }
};


export default function configureStore(initialState) {
  const enhancers = compact(selectStoreEnhancers());
  const store = createStore(rootReducer, initialState, compose(...enhancers));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
