import { Route, DefaultRoute } from 'react-router';
import React from 'react';

import App from './containers/App';
// Redux Smart
import Game from './containers/Game';
import Creator from './containers/Creator';
import Collection from './containers/Collection';
import Deck from './containers/Deck';
import Decks from './containers/Decks';
// Redux Dumb
//import HomePage from './components/Home';

export default (
  <Route name="app" path="/" component={App}>
    <Route path="home" component={Collection} />
    <Route path="game" component={Game} />
    <Route path="creator" component={Creator} />
    <Route path="collection" component={Collection} />
    <Route path="deck" component={Deck} />
    <Route path="decks" component={Decks} />
  </Route>
);
