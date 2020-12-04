import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Store } from 'redux';

import '../../styles/animations.css';
import '../../styles/index.css';
import '../../styles/lib.css';
import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';

require('object.values').shim();  // TODO remove this shim when Object.values() is no longer used in JS code

declare const window: {
  localStorage: Record<string, string>
  VERSION: string
  Perf?: any
};

const rootElement: HTMLElement | null = document.querySelector('#root');
const store: Store<any, any> = configureStore({
  version: window.VERSION
});

if (window.localStorage.profileOnLoad && window.Perf) {
  window.Perf.start();
}

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

if (window.localStorage.profileOnLoad && window.Perf) {
  window.Perf.stop();
  window.Perf.printInclusive();
}
