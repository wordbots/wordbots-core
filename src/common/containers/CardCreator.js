import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import * as cardCreatorActions from '../actions/cardCreator';

function mapStateToProps(state) {
  return {
    name: state.cardCreator.name,
    type: state.cardCreator.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetName: (name) => {
      dispatch(cardCreatorActions.setName(name));
    },
    onSetType: (type) => {
      dispatch(cardCreatorActions.setType(type));
    }
  };
}

class CardCreator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64, height: '100%'}}>
        <Helmet title="Cards"/>

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm
            name={this.props.name}
            type={this.props.type}

            onSetType={(type) => {
              this.props.onSetType(type);
            }}
            onSetName={(name) => {
              this.props.onSetName(name);
            }} />
          <CardPreview 
            name={this.props.name}
            type={this.props.type} />
        </div>
      </div>
    );
  }
}

CardCreator.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CardCreator);
