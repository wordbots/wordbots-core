/*eslint-disable import/no-unassigned-import */
import 'babel-core/register';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
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
  window.Perf.start();
  window.Perf.printInclusive();
}
