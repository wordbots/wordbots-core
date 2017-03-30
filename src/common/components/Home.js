import React, { Component } from 'react';
import Helmet from 'react-helmet';

import Collection from '../containers/Collection';

class Home extends Component {
  render() {
    return (
      // We don't have a home page yet, so just render the Collection view for now.
      <Collection />
    );
  }
}

export default Home;
