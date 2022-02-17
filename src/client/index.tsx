import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AnyAction, Store } from 'redux';

import { State } from '../common/types';
import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
import { registerGlobalDispatch } from '../common/store/globalDispatch';

import '../../styles/animations.css';
import '../../styles/index.css';
import '../../styles/lib.css';

require('object.values').shim();  // TODO remove this shim when Object.values() is no longer used in JS code

declare const window: {
  VERSION: string
};

const rootElement: HTMLElement | null = document.querySelector('#root');
const store: Store<State, AnyAction> = configureStore({ version: window.VERSION });
registerGlobalDispatch(store.dispatch);

ReactDOM.hydrate(
  (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  ),
  rootElement
);
