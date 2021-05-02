import { Button, Icon, MenuItem, Paper, Select, Snackbar } from '@material-ui/core';
import { find } from 'lodash';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { BigramProbs } from 'word-ngrams';

import * as w from '../types';
import { TYPE_EVENT } from '../constants';
import * as collectionActions from '../actions/collection';
import * as creatorActions from '../actions/creator';
import * as gameActions from '../actions/game';
import CardCreationForm from '../components/cards/CardCreationForm';
import CardCreationTutorial from '../components/cards/CardCreationTutorial';
import CardPreview from '../components/cards/CardPreview';
import CardProvenanceDescription from '../components/cards/CardProvenanceDescription';
import RouterDialog from '../components/RouterDialog';
import Title from '../components/Title';
import Tooltip from '../components/Tooltip';
import { CardValidationResults, createCardFromProps, getSentencesFromInput, requestParse, validateCardInCreator } from '../util/cards';
import CardTextExampleStore from '../util/CardTextExampleStore';
import { getCardById, getCardTextCorpus, lookupCurrentUser } from '../util/firebase';
import { prepareBigramProbs } from '../util/language';

export interface CreatorStateProps {
  id: string | null
  name: string
  type: w.CardType
  text: string
  flavorText: string
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
  tempSavedVersion: w.CardInStore | null
}

interface CreatorDispatchProps {
  onOpenCard: (card: w.CardInStore) => void
  onSetName: (name: string) => void
  onSetType: (type: w.CardType) => void
  onSetText: (text: string) => void
  onSetFlavorText: (flavorText: string) => void
  onSetAttribute: (attr: w.Attribute | 'cost', value: number) => void
  onParseComplete: (idx: number, sentence: string, result: w.ParseResult) => void
  onSpriteClick: () => void
  onAddExistingCardToCollection: (card: w.CardInStore) => void
  onAddNewCardToCollection: (props: w.CreatorState) => void
  onResetCreator: () => void
  onToggleWillCreateAnother: () => void
  onToggleIsPrivate: () => void
  onStartSandbox: (card: w.CardInStore) => void
  onClearTempVersion: () => void
}

type CreatorProps = CreatorStateProps & CreatorDispatchProps & RouteComponentProps;

interface CreatorState {
  bigramProbs?: BigramProbs
  cardOpenedForEditing?: w.CardInStore
  examplesLoaded: boolean
  isPermalinkCopied: boolean
  loaded: boolean
  submittedParseIssue: string | null
  submittedParseIssueConfirmationOpen: boolean
}

const exampleStore = new CardTextExampleStore();

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
    flavorText: state.creator.flavorText,
    parserVersion: state.creator.parserVersion,
    loggedIn: state.global.user !== null,
    willCreateAnother: state.creator.willCreateAnother,
    isPrivate: state.creator.isPrivate,
    cards: state.collection.cards,
    tempSavedVersion: state.creator.tempSavedVersion
  };
}

export function mapDispatchToProps(dispatch: Dispatch<any>): CreatorDispatchProps {
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
    onSetFlavorText: (flavorText: string) => {
      dispatch(creatorActions.setFlavorText(flavorText));
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
      dispatch([
        gameActions.startSandbox(card),
        creatorActions.saveTempVersion(card)
      ]);
    },
    onClearTempVersion: () => {
      dispatch(creatorActions.saveTempVersion(null));
    }
  };
}

export class Creator extends React.Component<CreatorProps, CreatorState> {
  public state: CreatorState = {
    examplesLoaded: false,
    isPermalinkCopied: false,
    loaded: false,
    submittedParseIssue: null,
    submittedParseIssueConfirmationOpen: false
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

  get permalinkUrl(): string {
    return window.location.href;
  }

  get parserMode(): 'event' | 'object' {
    return this.props.type === TYPE_EVENT ? 'event' : 'object';
  }

  get validationResults(): CardValidationResults {
    return validateCardInCreator(this.props);
  }

  public componentDidMount(): void {
    this.maybeLoadCard();
    this.loadExampleCards();
  }

  public render(): JSX.Element | null {
    const {
      bigramProbs, cardOpenedForEditing, examplesLoaded, isPermalinkCopied,
      loaded, submittedParseIssue, submittedParseIssueConfirmationOpen
    } = this.state;

    if (!loaded) {
      return null;
    }

    return (
      <div style={{position: 'relative'}}>
        <Helmet title="Workshop" />
        <Title text="Workshop" />

        <div style={{ display: 'inline' }}>
          <Button
            color="secondary"
            variant="contained"
            style={{ marginLeft: 20, marginTop: 9 }}
            onClick={this.handleClickNewCard}
          >
            <Icon style={{ marginRight: 10 }} className="material-icons">queue</Icon>
            <Tooltip inline text="Reset the workshop and start a new card from scratch." place="bottom" style={{ textTransform: 'none' }}>
              New Card
            </Tooltip>
          </Button>
          <Button
            color="secondary"
            variant="contained"
            style={{ marginLeft: 10, marginTop: 9 }}
            onClick={this.handleClickHelp}
          >
            <Icon style={{ marginRight: 10 }} className="material-icons">help_outline</Icon>
            <Tooltip inline text="Learn more about creating a card." place="bottom" style={{ textTransform: 'none' }}>
              Help
            </Tooltip>
          </Button>
          <Button
            color="secondary"
            variant="contained"
            style={{ marginLeft: 10, marginTop: 9 }}
            onClick={this.handleClickDictionary}
          >
            <Icon style={{ marginRight: 10 }} className="material-icons">book</Icon>
            <Tooltip inline text="Check out all of the terms and actions that the parser supports." place="bottom" style={{ textTransform: 'none' }}>
              Dictionary
            </Tooltip>
          </Button>
          <Button
            color="secondary"
            variant="contained"
            style={{ marginLeft: 10, marginTop: 9 }}
            onClick={this.handleClickRandomize}
            disabled={!examplesLoaded || !this.isCardEditable}
          >
            <Icon style={{ marginRight: 10 }} className="material-icons">refresh</Icon>
            <Tooltip
              inline
              text={`Generate random text for the card. ${examplesLoaded ? '' : '(Loading examples ...)'}`}
              place="bottom"
              style={{ textTransform: 'none' }}
            >
              Randomize
            </Tooltip>
          </Button>
          <Button
            color="secondary"
            variant="contained"
            style={{ marginLeft: 10, marginTop: 9 }}
            onClick={this.testCard}
            disabled={!this.validationResults.isValid}
          >
            <Icon style={{ marginRight: 10 }} className="material-icons">videogame_asset</Icon>
            <Tooltip inline text="Test out this card in sandbox mode." place="bottom" style={{ textTransform: 'none' }}>
              Test
            </Tooltip>
          </Button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxHeight: 'calc(100vh - 115px)',
          marginTop: 5
        }}>
          <div style={{
            width: '60%',
            flex: 1,
            paddingTop: 32,
            paddingLeft: 48,
            paddingRight: 20,
            overflowY: 'auto'
          }}>
            <CardCreationTutorial />
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
              flavorText={this.props.flavorText}
              isNewCard={!(this.props.id && this.props.cards.find((card) => card.id === this.props.id))}
              isReadonly={!this.isCardEditable}
              willCreateAnother={this.props.willCreateAnother}
              submittedParseIssue={submittedParseIssue}
              validationResults={this.validationResults}
              bigramProbs={bigramProbs}
              onSetName={this.props.onSetName}
              onSetType={this.props.onSetType}
              onUpdateText={this.onUpdateText}
              onSetFlavorText={this.props.onSetFlavorText}
              onSetAttribute={this.props.onSetAttribute}
              onParseComplete={this.props.onParseComplete}
              onSpriteClick={this.props.onSpriteClick}
              onOpenDialog={this.openDialog}
              onTestCard={this.testCard}
              onAddToCollection={this.addToCollection}
              onToggleWillCreateAnother={this.props.onToggleWillCreateAnother}
            />
            <Paper style={{ padding: 10, margin: '15px auto', maxWidth: 840, paddingTop: cardOpenedForEditing ? 10 : 0 }}>
              {
                cardOpenedForEditing
                  ? (
                  <div style={{ fontSize: '0.85em', color: '#666' }}>
                    <CardProvenanceDescription card={cardOpenedForEditing} style={{ display: 'inline' }} />{' '}
                    <CopyToClipboard text={this.permalinkUrl} onCopy={this.afterCopyPermalink}>
                      <a className="underline">{isPermalinkCopied ? 'Copied!' : '[Copy permalink]'}</a>
                    </CopyToClipboard>
                  </div>
                ) : this.renderCardCreationOptionsControls()
              }
            </Paper>
          </div>
          <div className="workshop-arrow" style={{ width: 50, margin: 'auto' }}>
            <Icon style={{ marginLeft: -5, fontSize: 100, color: '#ddd' }} className="material-icons">forward</Icon>
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
            flavorText={this.props.flavorText}
            onSpriteClick={this.props.onSpriteClick}
          />
        </div>

        <Snackbar
          open={submittedParseIssueConfirmationOpen}
          message={`Reported issue parsing '${submittedParseIssue}'. Thanks for the feedback!`}
          autoHideDuration={4000}
          onClose={this.handleCloseReportParseIssueSnackbar}
        />
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
          <Icon className="material-icons" style={{ position: 'relative', top: 6 }}>help</Icon>
        </Tooltip>
      </div>
    );
  }

  /** If there is a cardId in the URL, try to load the desired card. */
  private maybeLoadCard = async () => {
    const { cards, tempSavedVersion, history, location, match, onOpenCard, onClearTempVersion } = this.props;
    const params = (match ? match.params : {}) as Record<string, string | undefined>;
    const { cardId } = params;

    if (match) {
      if (cardId && cardId !== 'new') {
        // Search for the card in these locations, in order:
        // 1. tempSavedVersion prop from redux (if the card was temporarily saved previously, e.g. before testing in sandbox)
        // 2. location state (passed through the router, if a link was just followed)
        // 3. redux state (if the card is in the player's collection)
        // 4. firebase (async lookup)
        if (tempSavedVersion && tempSavedVersion.id === cardId) {
          onOpenCard(tempSavedVersion);
          onClearTempVersion();
        } else {
          const cardFromRouter = location.state?.card?.id === cardId ? location.state.card as w.CardInStore : undefined;
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
    }

    this.setState({ loaded: true });
  }

  private onUpdateText = (text: string, cardType: w.CardType = this.props.type, dontIndex = false) => {
    const parserMode = cardType === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    this.setState({ submittedParseIssue: null });
    requestParse(sentences, parserMode, this.props.onParseComplete, !dontIndex);
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

  private handleClickHelp = () => {
    this.openDialog('help');
  }

  private handleClickDictionary = () => {
    this.openDialog('dictionary');
  }

  private handleClickRandomize = () => {
    if (!this.isCardEditable) { return; }
    const example: string | null = exampleStore.getExample(this.parserMode);
    if (example) {
      this.onUpdateText(example, this.props.type, true);
    }
  }

  private handleCloseReportParseIssueSnackbar = () => {
    this.setState({ submittedParseIssueConfirmationOpen: false });
  }

  private testCard = () => {
    const card = createCardFromProps(this.props);
    this.props.onStartSandbox(card);
    this.props.history.push('/play/sandbox', { previous: this.props.history.location });
  }

  private addToCollection = (redirectToCollection: boolean) => {
    const { onAddExistingCardToCollection, onAddNewCardToCollection, history } = this.props;
    const { cardOpenedForEditing } = this.state;

    if (!this.isCardEditable && cardOpenedForEditing) {
      onAddExistingCardToCollection(cardOpenedForEditing);
    } else {
      onAddNewCardToCollection(this.props);
    }

    if (redirectToCollection) {
      history.push('/collection');
    }
  }

  private afterCopyPermalink = () => {
    this.setState({ isPermalinkCopied: true });
  }

  private loadExampleCards = async () => {
    const { corpus, examples } = await getCardTextCorpus();

    const bigramProbs = prepareBigramProbs(corpus);
    this.setState({ bigramProbs });

    exampleStore.loadExamples(examples, 100).then(() => {
      this.setState({ examplesLoaded: true });
    }).catch(console.error);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
