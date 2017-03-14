import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/lib/circular-progress';

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
      dispatch(creatorActions.addToCollection(props));

      // Redirect to Collection (only do this in the browser).
      // TODO find a way to hook into the router directly rather than using window.location.replace.
      if (typeof window !== 'undefined' && !(window.process && window.process.title.includes('node'))) {
        window.location.replace('/collection');
      }
    }
  };
}

export class Creator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saving: false
    };
  }

  render() {
    if (this.state.saving) {
      return (
        <div style={{height: '100%'}}>
          <div style={{margin: '300px auto', textAlign: 'center'}}>
            <CircularProgress />
          </div>
        </div>
      );
    } else {
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
              onAddToCollection={() => {
                this.setState({saving: true});
                this.props.onAddToCollection(this.props);
              }} />
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
}

Creator.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  textCleared: React.PropTypes.bool,
  sentences: React.PropTypes.array,
  spriteID: React.PropTypes.string,
  attack: React.PropTypes.number,
  speed: React.PropTypes.number,
  health: React.PropTypes.number,
  cost: React.PropTypes.number,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func,
  onSetText: React.PropTypes.func,
  onSetAttribute: React.PropTypes.func,
  onParseComplete: React.PropTypes.func,
  onSpriteClick: React.PropTypes.func,
  onAddToCollection: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Creator);
