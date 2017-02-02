import 'babel-core/register';
import ReactDOM from 'react-dom';
import React from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import configureStore from '../common/store/configureStore';
import routes from '../common/routes';
import '../../styles/index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';

const history = createBrowserHistory();
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
const rootElement = document.getElementById('root');

injectTapEventPlugin();

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>
      <Router children={routes} history={history} />
    </ReduxRouter>
  </Provider>,
  rootElement
);
