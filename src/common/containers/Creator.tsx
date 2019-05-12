import { History } from 'history';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { object } from 'prop-types';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as creatorActions from '../actions/creator';
import * as gameActions from '../actions/game';
import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import RouterDialog from '../components/RouterDialog';
import Title from '../components/Title';
import * as w from '../types';
import { createCardFromProps } from '../util/cards';

interface CreatorStateProps {
  id: string | null
  name: string
  type: w.CardType
  text: string
  sentences: w.Sentence[]
  spriteID: string
  attack: number
  speed: number
  health: number
  cost: number
  loggedIn: boolean
  parserVersion: number | null
  cards: w.CardInStore[]
}

interface CreatorDispatchProps {
  onSetName: (name: string) => void
  onSetType: (type: w.CardType) => void
  onSetText: (text: string) => void
  onSetAttribute: (attr: w.Attribute | 'cost', value: number) => void
  onParseComplete: (idx: number, sentence: string, result: w.ParseResult) => void
  onSpriteClick: () => void
  onAddToCollection: (props: w.CreatorState) => void
  onStartSandbox: (card: w.CardInStore) => void
}

type CreatorProps = CreatorStateProps & CreatorDispatchProps & { history: History };

export function mapStateToProps(state: w.State): CreatorStateProps {
  return {
    id: state.creator.id,
    name: state.creator.name,
    type: state.creator.type,
    attack: state.creator.attack,
    speed: state.creator.speed,
    health: state.creator.health,
    cost: state.creator.cost,
    spriteID: state.creator.spriteID,
    sentences: state.creator.sentences,
    text: state.creator.text,
    parserVersion: state.creator.parserVersion,
    loggedIn: state.global.user !== null,
    cards: state.collection.cards
  };
}

export function mapDispatchToProps(dispatch: Dispatch): CreatorDispatchProps {
  return {
    onSetName: (name: string) => {
      dispatch(creatorActions.setName(name));
    },
    onSetType: (type: w.CardType) => {
      dispatch(creatorActions.setType(type));
    },
    onSetText: (text: string) => {
      dispatch(creatorActions.setText(text));
    },
    onSetAttribute: (attr: w.Attribute | 'cost', value: number) => {
      dispatch(creatorActions.setAttribute(attr, value));
    },
    onParseComplete: (idx: number, sentence: string, result: w.ParseResult) => {
      dispatch(creatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(creatorActions.regenerateSprite());
    },
    onAddToCollection: (props: w.CreatorState) => {
      dispatch(creatorActions.addToCollection(props));
    },
    onStartSandbox: (card: w.CardInStore) => {
      dispatch(gameActions.startSandbox(card));
    }
  };
}

export class Creator extends React.Component<CreatorProps> {
  // For testing.
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

    // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public render(): JSX.Element {
    return (
      <div style={{position: 'relative'}}>
        <Helmet title="Creator" />
        <Title text="Creator" />

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm
            loggedIn={this.props.loggedIn}
            id={this.props.id}
            name={this.props.name}
            type={this.props.type}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            cost={this.props.cost}
            text={this.props.text}
            sentences={this.props.sentences}
            isNewCard={!(this.props.id && this.props.cards.find((card) => card.id === this.props.id))}
            onSetName={this.props.onSetName}
            onSetType={this.props.onSetType}
            onSetText={this.props.onSetText}
            onSetAttribute={this.props.onSetAttribute}
            onParseComplete={this.props.onParseComplete}
            onSpriteClick={this.props.onSpriteClick}
            onOpenDialog={this.openDialog}
            onTestCard={this.testCard}
            onAddToCollection={this.addToCollection}
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
              onSpriteClick={this.props.onSpriteClick}
            />
        </div>
      </div>
    );
  }

  private openDialog = (dialogPath: string) => {
    RouterDialog.openDialog(this.props.history, dialogPath);
  }

  private testCard = () => {
    const card = createCardFromProps(this.props);
    this.props.onStartSandbox(card);
    this.props.history.push('/play/sandbox', { previous: this.props.history.location });
  }

  private addToCollection = () => {
    this.props.onAddToCollection(this.props);
    this.props.history.push('/collection');
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
