/*eslint-disable import/no-unassigned-import */
import 'babel-core/register';
import ReactDOM from 'react-dom';
import React from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import injectTapEventPlugin from 'react-tap-event-plugin';

import configureStore from '../common/store/configureStore';
import routes from '../common/routes';
import '../../styles/index.css';
/* eslint-enable import/no-unassigned-import */

const history = createBrowserHistory();
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
const rootElement = document.getElementById('root');

injectTapEventPlugin();

// TODO Why doesn't this work??
ReactGA.initialize('UA-345959-18');
history.listen(location => {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
});

// See https://github.com/acdlite/redux-router/pull/282
const createRouterObject = require('react-router/lib/RouterUtils').createRouterObject;
require('react-router/lib/RouterUtils').createRouterObject = function (_history, transitionManager, state = {}) {
  return createRouterObject(_history, transitionManager, state);
};
const ReduxRouter = require('redux-router').ReduxRouter;

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>
      <Router children={routes} history={history} />
    </ReduxRouter>
  </Provider>,
  rootElement
);
