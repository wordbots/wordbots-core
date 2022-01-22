import Button from '@material-ui/core/Button';
import * as fb from 'firebase';
import { History } from 'history';
import { orderBy } from 'lodash';
import * as qs from 'qs';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AnyAction, compose, Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import Background from '../components/Background';
import ToolbarButton from '../components/ToolbarButton';
import SetSummary from '../components/cards/SetSummary';
import Title from '../components/Title';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as w from '../types';
import { getNumDecksCreatedCountBySetId } from '../util/firebase';
import PageHelp from '../components/PageHelp';

interface SetsStateProps {
  sets: w.Set[]
  user: fb.User | null
}

interface SetsDispatchProps {
  onCreateDeck: () => void
  onDeleteSet: (setId: string) => void
  onDuplicateSet: (setId: string) => void
  onEditSet: (setId: string) => void
  onPublishSet: (setId: string) => void
}

type SetsProps = SetsStateProps & SetsDispatchProps & { history: History };

interface SetsState {
  numDecksBySet?: Record<string, number>
}

function mapStateToProps(state: w.State): SetsStateProps {
  return {
    sets: state.collection.sets,
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): SetsDispatchProps {
  return {
    onCreateDeck: () => {
      dispatch(collectionActions.editDeck(null));
    },
    onDeleteSet: (setId: string) => {
      dispatch(collectionActions.deleteSet(setId));
    },
    onDuplicateSet: (setId: string) => {
      dispatch(collectionActions.duplicateSet(setId));
    },
    onEditSet: (setId: string) => {
      dispatch(collectionActions.editSet(setId));
    },
    onPublishSet: (setId: string) => {
      dispatch(collectionActions.publishSet(setId));
    }
  };
}

class Sets extends React.Component<SetsProps, SetsState> {
  public state: SetsState = {};

  /**
   * Returns either the single set to focus on (if there is a set=[setId] URL query parameter),
   * or null to display all published and user sets.
   */
  get singleSet(): w.Set | null {
    const { history: { location: { search }}, sets } = this.props;
    const setId: string | undefined = qs.parse(search.replace('?', '')).set;
    if (setId) {
      return sets.find((set) => set.id === setId) || null;
    }
    return null;
  }

  get publishedSets(): w.Set[] {
    const { sets } = this.props;
    const { numDecksBySet } = this.state;
    const unorderedPublishedSets = sets.filter((set) => set.metadata.isPublished);

    if (numDecksBySet) {
      return orderBy(unorderedPublishedSets, (set) => numDecksBySet[set.id] || 0, 'desc');
    } else {
      return unorderedPublishedSets;
    }
  }

  get userSets(): w.Set[] {
    const { sets, user } = this.props;
    return user ? orderBy(sets.filter((set) => set.metadata.authorId === user.uid), 'metadata.lastModified', 'desc') : [];
  }

  public componentDidMount(): void {
    const { sets } = this.props;
    sets.forEach(this.lookupAsyncInfoForSet);
  }

  public render(): JSX.Element {
    const { user } = this.props;

    return (
      <div>
        <Helmet title="Sets" />
        <Background asset="compressed/image2-1.jpg" opacity={0.35} />

        <Title text="Sets" />

        <div style={{ display: 'inline', paddingLeft: 10 }}>
          <MustBeLoggedIn loggedIn={!!user} style={{ display: 'inline-block' }}>
            <ToolbarButton
              icon="add_circle_outline"
              tooltip="Create a new set out of cards in your collection."
              onClick={this.handleCreateSet}
            >
              New Set
            </ToolbarButton>
          </MustBeLoggedIn>
        </div>

        <PageHelp openByDefault flagSuffix="sets">
          <p><b>Sets</b> offer a way for you to play games of Wordbots in which both players use the same pool of cards.</p>
          <p>You can take a popular set, make a deck from it, and play against other players who&rsquo;ve made decks using that set in the <b>Set format</b>. Or, play a game in the <b>Set Draft format</b>, where both players must  create decks from scratch using cards from a given set at the start of the game.</p>
          <p>If you&rsquo;re feeling creative, <i>create your own set</i> (using your own cards and/or cards you&rsquo;ve discovered), share it with your friends to challenge them, or publish it for the world to see!</p>
        </PageHelp>

        <div style={{ margin: 20 }}>
          {this.renderSets()}
        </div>
      </div>
    );
  }

  private renderSets = (): JSX.Element => {
    if (this.singleSet) {
      return (
        <div>
          <div style={{ margin: '20px 0' }}>
            {this.renderSetSummary(this.singleSet)}
          </div>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.handleShowAllSets}
          >
            <span style={{ fontFamily: 'Carter One' }}>Show all sets</span>
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          {
            this.publishedSets.length > 0 &&
              <div style={{ textAlign: 'center' }}>
                <h2>
                  <span style={{ fontFamily: 'Carter One' }}>Published sets </span>
                  <i>({this.publishedSets.length})</i>
                </h2>
                <div style={{ marginTop: -15, marginBottom: 15 }}>
                  These are sets that have been made public by their creators.
                </div>
                {this.publishedSets.map((set) => this.renderSetSummary(set, { inPublishedSetsList: true }))}
              </div>
          }
          {
            this.userSets.length > 0 &&
              <div style={{ textAlign: 'center' }}>
                <h2>
                  <span style={{ fontFamily: 'Carter One' }}>Your sets </span>
                  <i>({this.userSets.length})</i>
                </h2>
                <div style={{ marginTop: -15, marginBottom: 15 }}>
                  These are sets that you created! You can share them with your friends or publish them to the wider world.
                </div>
                {this.userSets.map((set) => this.renderSetSummary(set))}
              </div>
          }
        </div>
      );
    }
  }

  private renderSetSummary = (set: w.Set, extraProps: Record<string, unknown> = {}): JSX.Element => {
    const { user, history } = this.props;
    const { numDecksBySet } = this.state;
    return (
      <SetSummary
        key={set.id}
        set={set}
        user={user}
        numDecksCreated={numDecksBySet ? numDecksBySet[set.id] || 0 : undefined}
        isSingleSet={!!this.singleSet}
        history={history}
        onCreateDeckFromSet={this.handleCreateDeckFromSet(set.id)}
        onDeleteSet={this.handleDeleteSet(set.id)}
        onDuplicateSet={this.handleDuplicateSet(set.id)}
        onEditSet={this.handleEditSet(set.id)}
        onPublishSet={this.handlePublishSet(set.id)}
        {...extraProps}
      />
    );
  }

  private lookupAsyncInfoForSet = async (set: w.Set): Promise<void> => {
    const numDecks = await getNumDecksCreatedCountBySetId(set.id);

    this.setState((state) => ({
      numDecksBySet: {
        ...(state.numDecksBySet || {}),
        [set.id]: numDecks
      }
    }));
  }

  private handleCreateSet = () => {
    this.props.history.push('/sets/new');
  }

  private handleEditSet = (setId: string) => () => {
    this.props.onEditSet(setId);
    this.props.history.push(`/sets/${setId}`);
  }

  private handleCreateDeckFromSet = (setId: string) => () => {
    this.props.onCreateDeck();
    this.props.history.push(`/deck/for/set/${setId}`);
  }

  private handleDeleteSet = (setId: string) => () => {
    this.props.onDeleteSet(setId);
  }

  private handleDuplicateSet = (setId: string) => () => {
    this.props.onDuplicateSet(setId);
  }

  private handlePublishSet = (setId: string) => () => {
    this.props.onPublishSet(setId);
  }

  private handleShowAllSets = () => {
    this.props.history.push('/sets');
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Sets);
