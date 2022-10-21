import { compact } from 'lodash';
import {
  AnyAction, applyMiddleware, compose,
  createStore, DeepPartial, Middleware, Store, StoreEnhancer
} from 'redux';

import { SOCKET_ACTION_TYPES } from '../actions';
import { ALWAYS_ENABLE_DEV_TOOLS, ENABLE_REDUX_TIME_TRAVEL } from '../constants';
import multipleDispatchMiddleware from '../middleware/multipleDispatchMiddleware';
import createSocketMiddleware from '../middleware/socketMiddleware';
import rootReducer from '../reducers';
import * as w from '../types';

declare const module: { dev: any, hot: any };
declare const process: { browser: any, env: { NODE_ENV: string } };

const DEV_TOOLS_ENABLED = ALWAYS_ENABLE_DEV_TOOLS || !['production', 'test'].includes(process.env.NODE_ENV);

const selectStoreEnhancers = (): StoreEnhancer[] => {
  if (process.browser) {
    const socketMiddleware: Middleware = createSocketMiddleware({ forwardedActionTypes: SOCKET_ACTION_TYPES });

    if (DEV_TOOLS_ENABLED) {
      const createLogger: () => Middleware = require('redux-logger').createLogger;
      const DevTools = require('../containers/DevTools').default;

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

export default function configureStore(initialState: DeepPartial<w.State>): Store<w.State, AnyAction> {
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
