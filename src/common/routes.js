import { Route } from 'react-router';
import React from 'react';
import App from './containers/App';

// Redux Smart
import Game from './containers/Game';
import Cards from './containers/Cards';

// Redux Dumb
import HomePage from './components/Home';

export default (
  <Route name="app" path="/" component={App}>
    <Route path="home" component={HomePage} />
    <Route path="game" component={Game} />
    <Route path="cards" component={Cards} />
  </Route>
);
