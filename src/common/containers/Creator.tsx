import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import { FontIcon } from 'material-ui';
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
import { lookupCurrentUser } from '../util/firebase';

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
  onToggleWillCreateAnother: () => void
  onToggleIsPrivate: () => void
  onStartSandbox: (card: w.CardInStore) => void
}

type CreatorProps = CreatorStateProps & CreatorDispatchProps & RouteComponentProps;

interface CreatorState {
  cardOpenedForEditing?: w.CardInStore
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
      dispatch(creatorActions.addToCollection(props));
    },
    onAddExistingCardToCollection: (props: w.CardInStore) => {
      dispatch(creatorActions.addExistingCardToCollection(props));
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

  public state: CreatorState = {};

  get isCardEditable(): boolean {
    const { cardOpenedForEditing } = this.state;
    if (cardOpenedForEditing && cardOpenedForEditing.source) {
      const { source } = cardOpenedForEditing;
      if (source) {
        const currentUser = lookupCurrentUser();
        return source !== 'builtin' && !!currentUser && source.uid === currentUser.uid;
      }
    }

    return true;
  }

  public componentDidMount(): void {
    this.maybeLoadCard();
  }

  public componentDidUpdate(prevProps: CreatorProps): void {
    const { id, cards } = this.props;

    // If we haven't yet loaded a card and we now have a bigger pool of cards
    // (e.g. because we just received all the user's cards from Firebase), try loading the card again.
    // TODO Should we also allow loading cards by ID even if you don't own them? (This would require searching by card ID in Firebase.)
    if (!id && cards.length > prevProps.cards.length) {
      this.maybeLoadCard();
    }
  }

    // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public render(): JSX.Element {
    const { cardOpenedForEditing } = this.state;

    return (
      <div style={{position: 'relative'}}>
        <Helmet title="Creator" />
        <Title text="Creator" />

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
            <Paper style={{ padding: cardOpenedForEditing ? 10 : 0, marginTop: 20 }}>
              {
                cardOpenedForEditing
                  ? <CardProvenanceDescription card={cardOpenedForEditing} style={{ color: '#666', fontSize: '0.85em' }} />
                  : (
                    <div style={{ textAlign: 'right', fontSize: 13 }}>
                      Card visibility:
                      <span style={{ marginLeft: 10 }}>
                        <FormControlLabel
                          control={<Switch checked={this.props.isPrivate} onChange={this.props.onToggleIsPrivate} />}
                          label={
                            <span>
                              <span style={{ fontSize: 15, fontVariant: 'all-small-caps', position: 'relative', top: -6, left: -4, paddingRight: 2 }}>
                                {this.props.isPrivate ? "Private" : "Public"}
                              </span>
                              <Tooltip
                                inline
                                text="Private cards won't show up on your profile page or on the Recent Cards carousel on the homepage."
                              >
                                <FontIcon className="material-icons">help</FontIcon>
                              </Tooltip>
                            </span>
                          }
                        />
                      </span>
                    </div>
                  )
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

  private maybeLoadCard = () => {
    const { cards, location, match, onOpenCard } = this.props;
    const params = (match ? match.params : {}) as Record<string, string | undefined>;
    const { cardId } = params;

    if (cardId) {
      const cardFromRouter = location.state && location.state.card ? location.state.card as w.CardInStore : undefined;
      const card: w.CardInStore | undefined = (cardFromRouter && cardFromRouter.id === cardId) ? cardFromRouter : cards.find((c) => c.id === cardId);

      if (card) {
        this.setState({ cardOpenedForEditing: card }, () => {
          onOpenCard(card);
        });
      }
    }
  }

  private openDialog = (dialogPath: string) => {
    RouterDialog.openDialog(this.props.history, dialogPath);
  }

  private testCard = () => {
    const card = createCardFromProps(this.props);
    this.props.onStartSandbox(card);
    this.props.history.push('/play/sandbox', { previous: this.props.history.location });
  }

  private addToCollection = (redirectToCollection: boolean) => {
    const { onAddExistingCardToCollection, onAddNewCardToCollection, history } = this.props;
    const { cardOpenedForEditing } = this.state;

    if (cardOpenedForEditing) {
      onAddExistingCardToCollection(cardOpenedForEditing);
    } else {
      onAddNewCardToCollection(this.props);
    }

    if (redirectToCollection) {
      history.push('/collection');
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
