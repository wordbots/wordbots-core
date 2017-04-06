/*eslint-disable import/no-unassigned-import */
import 'babel-core/register';
import ReactDOM from 'react-dom';
import React from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';
import { ReduxRouter } from 'redux-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import injectTapEventPlugin from 'react-tap-event-plugin';

import configureStore from '../common/store/configureStore';
import routes from '../common/routes';
import '../../styles/index.css';
/*eslint-enable import/no-unassigned-import */

const history = createBrowserHistory();
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
const rootElement = document.getElementById('root');

injectTapEventPlugin();

ReactGA.initialize('UA-345959-18');

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>
      <Router children={routes} history={history} onUpdate={logPageView} />
    </ReduxRouter>
  </Provider>,
  rootElement
);
