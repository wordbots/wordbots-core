import { Route } from 'react-router';
import React from 'react';

import App from './containers/App';
// Redux Smart
import Game from './containers/Game';
import Creator from './containers/Creator';
import Collection from './containers/Collection';
// Redux Dumb
//import HomePage from './components/Home';

export default (
  <Route name="app" path="/" component={App}>
    <Route path="home" component={Collection} />
    <Route path="game" component={Game} />
    <Route path="creator" component={Creator} />
    <Route path="collection" component={Collection} />
  </Route>
);
