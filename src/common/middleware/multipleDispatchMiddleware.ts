import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

import * as w from '../types';

// See https://github.com/ashaffer/redux-multi/blob/master/src/index.js
function multipleDispatchMiddleware(store: MiddlewareAPI<Dispatch<AnyAction>, w.State>): (next: Dispatch<AnyAction>) => (action: any) => any {
  return (next: Dispatch<AnyAction>) => (action: AnyAction) =>
    Array.isArray(action)
      ? action.filter(Boolean).map(store.dispatch)
      : next(action);
}

export default multipleDispatchMiddleware;
