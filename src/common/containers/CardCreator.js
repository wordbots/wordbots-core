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
    attack: state.cardCreator.attack,
    speed: state.cardCreator.speed,
    health: state.cardCreator.health,
    cost: state.cardCreator.energy,
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
    onSetAttack: (attack) => {
      dispatch(cardCreatorActions.setAttack(attack));
    },
    onSetSpeed: (speed) => {
      dispatch(cardCreatorActions.setSpeed(speed));
    },
    onSetHealth: (health) => {
      dispatch(cardCreatorActions.setHealth(health));
    },
    onSetEnergy: (energy) => {
      dispatch(cardCreatorActions.setEnergy(energy));
    },
    onParseComplete: (idx, sentence, result) => {
      dispatch(cardCreatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(cardCreatorActions.regenerateSprite());
    },
    onAddToCollection: (props) => {
      dispatch(cardCreatorActions.addToCollection(props));
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
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            sentences={this.props.sentences}
            onSetName={(name) => { this.props.onSetName(name); }}
            onSetType={(type) => { this.props.onSetType(type); }}
            onSetText={(text) => { this.props.onSetText(text); }}
            onSetAttack={(attack) => { this.props.onSetAttack(attack); }}
            onSetSpeed={(speed) => { this.props.onSetSpeed(speed); }}
            onSetHealth={(health) => { this.props.onSetHealth(health); }}
            onSetEnergy={(energy) => { this.props.onSetEnergy(energy); }}
            onParseComplete={(idx, sentence, json) => { this.props.onParseComplete(idx, sentence, json); }}
            onSpriteClick={() => { this.props.onSpriteClick(); }}
            onAddToCollection={() => { this.props.onAddToCollection(this.props); }}
            />
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

CardCreator.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  sentences: React.PropTypes.array,
  spriteID: React.PropTypes.string,
  attack: React.PropTypes.number,
  speed: React.PropTypes.number,
  health: React.PropTypes.number,
  cost: React.PropTypes.number,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func,
  onSetText: React.PropTypes.func,
  onSetAttack: React.PropTypes.func,
  onSetSpeed: React.PropTypes.func,
  onSetHealth: React.PropTypes.func,
  onSetEnergy: React.PropTypes.func,

  onParseComplete: React.PropTypes.func,
  onSpriteClick: React.PropTypes.func,
  onAddToCollection: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CardCreator);
