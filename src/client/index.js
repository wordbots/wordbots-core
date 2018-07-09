/*eslint-disable import/no-unassigned-import */
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import * as injectTapEventPlugin from 'react-tap-event-plugin';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore.ts';
import '../../styles/index.css';
import '../../styles/lib.css';
import '../../styles/animations.css';
/* eslint-enable import/no-unassigned-import */

const rootElement = document.getElementById('root');
const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

injectTapEventPlugin();

if (window.localStorage['profileOnLoad'] && window.Perf) {
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

if (window.localStorage['profileOnLoad'] && window.Perf) {
  window.Perf.stop();
  window.Perf.printInclusive();
}
