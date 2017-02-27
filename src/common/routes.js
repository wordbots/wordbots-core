import { Route } from 'react-router';
import React from 'react';

import App from './containers/App';
// Redux Smart
import Game from './containers/Game';
import CardCreator from './containers/CardCreator';
import Collection from './containers/Collection';
// Redux Dumb
import HomePage from './components/Home';

export default (
  <Route name="app" path="/" component={App}>
    <Route path="home" component={HomePage} />
    <Route path="game" component={Game} />
    <Route path="cardCreator" component={CardCreator} />
    <Route path="collection" component={Collection} />
  </Route>
);
