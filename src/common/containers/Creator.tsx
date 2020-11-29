import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { find } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { object } from 'prop-types';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';
import * as gameActions from '../actions/game';
import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import CardProvenanceDescription from '../components/cards/CardProvenanceDescription';
import RouterDialog from '../components/RouterDialog';
import Title from '../components/Title';
import Tooltip from '../components/Tooltip';
import * as w from '../types';
import { createCardFromProps } from '../util/cards';
import { getCardById, lookupCurrentUser } from '../util/firebase';

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
  willCreateAnother: boolean
  isPrivate?: boolean
  cards: w.CardInStore[]
}

interface CreatorDispatchProps {
  onOpenCard: (card: w.CardInStore) => void
  onSetName: (name: string) => void
  onSetType: (type: w.CardType) => void
  onSetText: (text: string) => void
  onSetAttribute: (attr: w.Attribute | 'cost', value: number) => void
  onParseComplete: (idx: number, sentence: string, result: w.ParseResult) => void
  onSpriteClick: () => void
  onAddExistingCardToCollection: (card: w.CardInStore) => void
  onAddNewCardToCollection: (props: w.CreatorState) => void
  onResetCreator: () => void
  onToggleWillCreateAnother: () => void
  onToggleIsPrivate: () => void
  onStartSandbox: (card: w.CardInStore) => void
}

type CreatorProps = CreatorStateProps & CreatorDispatchProps & RouteComponentProps;

interface CreatorState {
  cardOpenedForEditing?: w.CardInStore
  loaded: boolean
}

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
    willCreateAnother: state.creator.willCreateAnother,
    isPrivate: state.creator.isPrivate,
    cards: state.collection.cards
  };
}

export function mapDispatchToProps(dispatch: Dispatch): CreatorDispatchProps {
  return {
    onOpenCard: (card: w.CardInStore) => {
      dispatch(collectionActions.openForEditing(card));
    },
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
    onAddNewCardToCollection: (props: w.CreatorState) => {
      dispatch(creatorActions.saveCard(props));
    },
    onAddExistingCardToCollection: (props: w.CardInStore) => {
      dispatch(creatorActions.addExistingCardToCollection(props));
    },
    onResetCreator: () => {
      dispatch(creatorActions.resetCreator());
    },
    onToggleWillCreateAnother: () => {
      dispatch(creatorActions.toggleWillCreateAnother());
    },
    onToggleIsPrivate: () => {
      dispatch(creatorActions.togglePrivate());
    },
    onStartSandbox: (card: w.CardInStore) => {
      dispatch(gameActions.startSandbox(card));
    }
  };
}

export class Creator extends React.Component<CreatorProps, CreatorState> {
  // For testing.
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

  public state: CreatorState = {
    loaded: false
  };

  get isCardEditable(): boolean {
    const { cardOpenedForEditing } = this.state;
    if (cardOpenedForEditing) {
      const { source } = cardOpenedForEditing.metadata;
      const currentUser = lookupCurrentUser();
      return !!currentUser && source.type === 'user' && source.uid === currentUser.uid;
    }

    return true;
  }

  public componentDidMount(): void {
    this.maybeLoadCard();
  }

    // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public render(): JSX.Element | null {
    const { cardOpenedForEditing, loaded } = this.state;

    if (!loaded) {
      return null;
    }

    return (
      <div style={{position: 'relative'}}>
        <Helmet title="Creator" />
        <Title text="Creator" />

        <RaisedButton
          label="New Card"
          labelPosition="after"
          primary
          icon={<FontIcon style={{ margin: '0 5px 0 15px' }} className="material-icons">queue</FontIcon>}
          style={{ marginLeft: 40, marginTop: 9 }}
          onClick={this.handleClickNewCard}
        />

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{width: '60%', flex: 1, paddingTop: 64, paddingLeft: 48, paddingRight: 32}}>
            <CardCreationForm
              key={this.props.id || 'newCard'}
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
              isReadonly={!this.isCardEditable}
              willCreateAnother={this.props.willCreateAnother}
              onSetName={this.props.onSetName}
              onSetType={this.props.onSetType}
              onSetText={this.props.onSetText}
              onSetAttribute={this.props.onSetAttribute}
              onParseComplete={this.props.onParseComplete}
              onSpriteClick={this.props.onSpriteClick}
              onOpenDialog={this.openDialog}
              onTestCard={this.testCard}
              onAddToCollection={this.addToCollection}
              onToggleWillCreateAnother={this.props.onToggleWillCreateAnother}
            />
            <Paper style={{ padding: 10, marginTop: 20, paddingTop: cardOpenedForEditing ? 10 : 0 }}>
              {
                cardOpenedForEditing
                  ? <CardProvenanceDescription card={cardOpenedForEditing} style={{ color: '#666', fontSize: '0.85em' }} />
                  : this.renderCardCreationOptionsControls()
              }
            </Paper>
          </div>
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

  private renderCardCreationOptionsControls = () => {
    const { isPrivate, onToggleIsPrivate } = this.props;
    return (
      <div style={{ textAlign: 'right', fontSize: 13 }}>
        Card visibility:
        <Select
          style={{ marginLeft: 10, fontSize: '0.9em' }}
          value={isPrivate ? 'private' : 'public'}
          onChange={onToggleIsPrivate}
        >
          <MenuItem key="public" value="public">Public</MenuItem>
          <MenuItem key="private" value="private">Private</MenuItem>
        </Select>
        <Tooltip
          inline
          text="Private cards won't show up on your profile page or on the Recent Cards carousel on the homepage."
        >
          <FontIcon className="material-icons" style={{ position: 'relative', top: 6 }}>help</FontIcon>
        </Tooltip>
      </div>
    );
  }

  /** If there is a cardId in the URL, try to load the desired card. */
  private maybeLoadCard = async () => {
    const { cards, history, location, match, onOpenCard } = this.props;
    const params = (match ? match.params : {}) as Record<string, string | undefined>;
    const { cardId } = params;

    if (match) {
      if (cardId && cardId !== 'new') {
        // Search for the card in these locations, in order:
        // 1. location state (passed through the router, if a link was just followed)
        // 2. redux state (if the card is in the player's collection)
        // 3. firebase (async lookup)
        const cardFromRouter = location.state && location.state.card && (location.state.card.id === cardId) ? location.state.card as w.CardInStore : undefined;
        const card: w.CardInStore | undefined = cardFromRouter || find(cards, { id: cardId }) || await getCardById(cardId);

        if (card) {
          this.setState({ cardOpenedForEditing: card }, () => {
            onOpenCard(card);
          });
        } else {
          // If card not found, redirect to the new card URL.
          history.replace('/card/new');
        }
      }
    }

    this.setState({ loaded: true });
  }

  private openDialog = (dialogPath: string) => {
    RouterDialog.openDialog(this.props.history, dialogPath);
  }

  private handleClickNewCard = () => {
    this.setState({
      cardOpenedForEditing: undefined
    }, () => {
      this.props.onResetCreator();
      this.props.history.push('/card/new');
    });
  }

  private testCard = () => {
    const card = createCardFromProps(this.props);
    this.props.onStartSandbox(card);
    this.props.history.push('/play/sandbox', { previous: this.props.history.location });
  }

  private addToCollection = (redirectToCollection: boolean) => {
    const { onAddExistingCardToCollection, onAddNewCardToCollection, history } = this.props;
    const { cardOpenedForEditing } = this.state;

    if (!this.isCardEditable) {
      onAddExistingCardToCollection(cardOpenedForEditing!);
    } else {
      onAddNewCardToCollection(this.props);
    }

    if (redirectToCollection) {
      history.push('/collection');
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
