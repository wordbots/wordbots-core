import React, { Component } from 'react';
import Helmet from 'react-helmet';

import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';

class Cards extends Component {
  render() {
    return (
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64}}>
        <Helmet title="Cards"/>

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm />
          <CardPreview />
        </div>
      </div>
    );
  }
}

export default Cards;
