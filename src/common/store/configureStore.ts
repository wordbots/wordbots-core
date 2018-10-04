import {
  createStore, applyMiddleware, compose,
  AnyAction, Middleware, Store, StoreEnhancer
} from 'redux';
import { compact } from 'lodash';

import * as w from '../types';
import { ALWAYS_ENABLE_DEV_TOOLS, ENABLE_REDUX_TIME_TRAVEL } from '../constants';
import multipleDispatchMiddleware from '../middleware/multipleDispatchMiddleware';
import createSocketMiddleware from '../middleware/socketMiddleware';
import rootReducer from '../reducers';
import * as socketActions from '../actions/socket';

declare const module: { dev: any, hot: any };
declare const process: { browser: any, env: { NODE_ENV: string } };

const DEV_TOOLS_ENABLED = ALWAYS_ENABLE_DEV_TOOLS || !['production', 'test'].includes(process.env.NODE_ENV);

const selectStoreEnhancers = (): StoreEnhancer[] => {
  if (process.browser) {
    const socketMiddleware: Middleware = createSocketMiddleware({
      excludedActions: [socketActions.CONNECTING, socketActions.CONNECTED, socketActions.DISCONNECTED]
    });

    if (DEV_TOOLS_ENABLED) {
      const createLogger: () => Middleware = require('redux-logger').createLogger;
      const DevTools = require('../containers/DevTools').default;

      // react-addons-perf unsupported as of React 16.0.0.
      // const Perf = require('react-addons-perf');
      // window.Perf = Perf;

      return [
        applyMiddleware(multipleDispatchMiddleware, socketMiddleware, createLogger()),
        ENABLE_REDUX_TIME_TRAVEL ? DevTools.instrument() : null
      ];
    } else {
      return [applyMiddleware(multipleDispatchMiddleware, socketMiddleware)];
    }
  } else {
    return [applyMiddleware(multipleDispatchMiddleware)];
  }
};

export default function configureStore(initialState: Partial<w.State>): Store<w.State, AnyAction> {
  const enhancers = compact(selectStoreEnhancers());
  const store: Store<w.State> = createStore(rootReducer, initialState, compose(...enhancers));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
