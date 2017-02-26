import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import * as cardCreatorActions from '../actions/cardCreator';

function mapStateToProps(state) {
  return {
    name: state.cardCreator.name,
    type: state.cardCreator.type,
    spriteID: state.cardCreator.spriteID,
    sentences: state.cardCreator.sentences
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetName: (name) => {
      dispatch(cardCreatorActions.setName(name));
    },
    onSetType: (type) => {
      dispatch(cardCreatorActions.setType(type));
    },
    onSetText: (text) => {
      dispatch(cardCreatorActions.setText(text));
    },
    onParseComplete: (idx, sentence, result) => {
      dispatch(cardCreatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(cardCreatorActions.regenerateSprite());
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
            onSetName={(name) => { this.props.onSetName(name); }}
            onSetType={(type) => { this.props.onSetType(type); }}
            onSetText={(text) => { this.props.onSetText(text); }}
            onParseComplete={(idx, sentence, json) => { this.props.onParseComplete(idx, sentence, json); }}
            />
          <CardPreview
            name={this.props.name}
            type={this.props.type}
            spriteID={this.props.spriteID}
            sentences={this.props.sentences}
            onSpriteClick={() => { this.props.onSpriteClick(); }} />
        </div>
      </div>
    );
  }
}

CardCreator.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  spriteID: React.PropTypes.string,
  sentences: React.PropTypes.array,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func,
  onSetText: React.PropTypes.func,
  onParseComplete: React.PropTypes.func,
  onSpriteClick: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CardCreator);
