/*eslint-disable import/no-unassigned-import */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
import '../../styles/index.css';
import '../../styles/lib.css';
import '../../styles/animations.css';
/* eslint-enable import/no-unassigned-import */

declare const window: {
  localStorage: Record<string, string>
  VERSION: string
  Perf?: any
};

const rootElement: HTMLElement | null = document.getElementById('root');
const store: Store<any, any> = configureStore({
  version: window.VERSION
});

if (window.localStorage.profileOnLoad && window.Perf) {
  window.Perf.start();
}

ReactDOM.hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  rootElement
);

if (window.localStorage.profileOnLoad && window.Perf) {
  window.Perf.stop();
  window.Perf.printInclusive();
}
