import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import * as creatorActions from '../actions/creator';

export function mapStateToProps(state) {
  return {
    name: state.creator.name,
    type: state.creator.type,
    attack: state.creator.attack,
    speed: state.creator.speed,
    health: state.creator.health,
    cost: state.creator.energy,
    spriteID: state.creator.spriteID,
    sentences: state.creator.sentences,
    textCleared: state.creator.textCleared
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onSetName: (name) => {
      dispatch(creatorActions.setName(name));
    },
    onSetType: (type) => {
      dispatch(creatorActions.setType(type));
    },
    onSetText: (text) => {
      dispatch(creatorActions.setText(text));
    },
    onSetAttribute: (attr, value) => {
      dispatch(creatorActions.setAttribute(attr, value));
    },
    onParseComplete: (idx, sentence, result) => {
      dispatch(creatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(creatorActions.regenerateSprite());
    },
    onAddToCollection: (props) => {
      dispatch([
        creatorActions.addToCollection(props),
        pushState(null, '/collection')
      ]);
    }
  };
}

export class Creator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Helmet title="Creator"/>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm
            name={this.props.name}
            type={this.props.type}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            sentences={this.props.sentences}
            textCleared={this.props.textCleared}g
            onSetName={(name) => { this.props.onSetName(name); }}
            onSetType={(type) => { this.props.onSetType(type); }}
            onSetText={(text) => { this.props.onSetText(text); }}
            onSetAttribute={(attr, value) => { this.props.onSetAttribute(attr, value); }}
            onParseComplete={(idx, sentence, json) => { this.props.onParseComplete(idx, sentence, json); }}
            onSpriteClick={() => { this.props.onSpriteClick(); }}
            onAddToCollection={() => { this.props.onAddToCollection(this.props); }} />
          <CardPreview
            name={this.props.name}
            type={this.props.type}
            spriteID={this.props.spriteID}
            sentences={this.props.sentences}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            onSpriteClick={() => { this.props.onSpriteClick(); }} />
        </div>
      </div>
    );
  }
}

const { array, bool, func, number, string } = React.PropTypes;

Creator.propTypes = {
  name: string,
  type: number,
  textCleared: bool,
  sentences: array,
  spriteID: string,
  attack: number,
  speed: number,
  health: number,
  cost: number,

  onSetName: func,
  onSetType: func,
  onSetText: func,
  onSetAttribute: func,
  onParseComplete: func,
  onSpriteClick: func,
  onAddToCollection: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Creator);
