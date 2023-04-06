import { UserCredential } from '@firebase/auth-types';
import * as firebase from 'firebase/app';
import { capitalize, concat, flatMap, fromPairs, identity, mapValues, uniq } from 'lodash';
import * as _ from 'lodash/fp';
import { flow } from 'lodash/fp';
import 'firebase/auth';  // eslint-disable-line import/no-unassigned-import
import 'firebase/database';  // eslint-disable-line import/no-unassigned-import

import { FIREBASE_CONFIG } from '../constants';
import * as w from '../types';

import { expandKeywords, loadParserLexicon, normalizeCard } from './cards';
import { withoutEmptyFields } from './common';

const fb = require('firebase/app').default;

let currentUser: firebase.User | null = null;

if (fb.apps.length === 0) {
  fb.initializeApp(FIREBASE_CONFIG);
  // (window as any).fb = fb;

  fb.auth().onAuthStateChanged((user: firebase.User | null) => {
    currentUser = user;
  });
}


// UTIL FUNCTIONS

/** Perform a Firebase DB query "corresponding" to:
  *   `SELECT * from [ref] WHERE [child] == [value]` */
async function query(ref: string, child: string, value: string): Promise<firebase.database.DataSnapshot> {
  return await fb.database()
    .ref(ref)
    .orderByChild(child)
    .equalTo(value)
    .once('value');
}

/** As `query()`, but also unpack the resulting values,
  * returning (a promise of) an array of the desired objects. */
async function queryObjects<T>(ref: string, child: string, value: string): Promise<T[]> {
  const snapshot = await query(ref, child, value);
  return snapshot?.val() ? Object.values(snapshot.val() as Record<string, T>) : [];
}

// USERS

/** Save a given User object under `/users`. */
function saveUser(user: firebase.User): Promise<firebase.User> {
  return fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    })
    .then(() => user);
}

/** Return the currently logged-in user or null. */
export function lookupCurrentUser(): firebase.User | null {
  return currentUser || fb.auth().currentUser;
}

/** If logged in, return the current user's display name, otherwise return the fallback username. */
export function lookupUsername(fallback = 'You'): string {
  return currentUser?.displayName || fallback;
}

/** Register a callback to perform when the user logs in. (Also track currentUser) */
export function onLogin(callback: (user: firebase.User) => void): firebase.Unsubscribe {
  return fb.auth().onAuthStateChanged((user: firebase.User) => {
    if (user) {
      callback(user);
    }
  });
}

/** Register a callback to perform when the user logs out. */
export function onLogout(callback: () => void): firebase.Unsubscribe {
  return fb.auth().onAuthStateChanged((user: firebase.User) => {
    if (!user) {
      callback();
    }
  });
}

/** Register a new User given account information. */
export async function register(email: string, username: string, password: string): Promise<void> {
  const credential: UserCredential = await fb.auth().createUserWithEmailAndPassword(email, password);

  if (credential.user) {
    const { user } = credential;
    await user.updateProfile({ displayName: username, photoURL: null });
    await saveUser(user);
    await fb.auth().currentUser.getIdToken(true); // Refresh current user's ID token so displayName gets displayed
  }
}

/** Log in with the given credentials. */
export function login(email: string, password: string): Promise<firebase.User> {
  return fb.auth().signInWithEmailAndPassword(email, password);
}

/** Log out. */
export function logout(): Promise<void> {
  return fb.auth().signOut();
}

/** Send a password reset email to the given email address. */
export function resetPassword(email: string): Promise<void> {
  return fb.auth().sendPasswordResetEmail(email);
}

/** Yield all `User`s under `/users`. */
export async function getUsers(): Promise<w.User[]> {
  const snapshot = await fb.database().ref('users').once('value');
  return Object.values(snapshot.val());
}

/** Given a array of user IDs, yield a corresponding array of usernames. */
export async function getUserNamesByIds(userIds: string[]): Promise<string[]> {
  const userLookupRefs = userIds.map((userId) => fb.database().ref(`users/${userId}/info/displayName`).once('value'));
  const users = await Promise.all(userLookupRefs);
  return users.map((user) => user.val());
}

/** Yield all achievement name registered to the currently logged-in user (or []). */
export async function getAchievements(): Promise<string[]> {
  const user = lookupCurrentUser();
  if (user) {
    const snapshot = await fb.database().ref(`users/${user.uid}/achievements`).once('value');
    const achievements = snapshot.val();
    return achievements ? Object.keys(achievements) : [];
  }

  return [];
}

/** Register an achievement name to the currently logged-in user (if any). */
export function markAchievement(achievementName: string): void {
  const user = lookupCurrentUser();
  if (user) {
    fb.database()
      .ref(`users/${user.uid}/achievements/${achievementName}`)
      .set(true);
  }
}

/** Yield the statistics recorded for a given user id. */
async function getStatistics(uid: string): Promise<Record<string, number>> {
  const snapshot = await fb.database().ref(`users/${uid}/statistics`).once('value');
  return snapshot.val() || {};
}

/** Record a statistic for a given user id. */
export async function setStatistic(uid: string, statisticName: string, value: number): Promise<void> {
  const statisticRef = fb.database().ref(`users/${uid}/statistics/${statisticName}`);
  statisticRef.set(value);
}

/** Increment the given statistic by 1 for the currently logged-in user (if any). */
export async function incrementStatistic(statisticName: string): Promise<void> {
  const user = lookupCurrentUser();
  if (user) {
    const statisticRef = fb.database().ref(`users/${user.uid}/statistics/${statisticName}`);
    const currentVal = (await getStatistics(user.uid))[statisticName];
    statisticRef.set((currentVal || 0) + 1);
  }
}

// GAME RESULTS

export function saveGame(game: w.SavedGame): firebase.database.ThenableReference {
  incrementStatistic('gamesPlayed');
  return fb.database().ref('games').push(game);
}

export async function getGamesByUser(userId: w.UserId): Promise<w.SavedGame[]> {
  const blueGames = await queryObjects<w.SavedGame>('games', 'players/blue', userId);
  const orangeGames = await queryObjects<w.SavedGame>('games', 'players/orange', userId);
  return flow(
    _.uniqBy((g: w.SavedGame) => g.id),
    _.orderBy('timestamp', 'desc')
  )([...blueGames, ...orangeGames]) as w.SavedGame[];
}

export async function getNumGamesBySetFormat(formatType: 'set' | 'setDraft', setId: w.SetId): Promise<number> {
  const games = await queryObjects<w.SavedGame>('games', 'format/set/id', setId);
  return games.filter((g) => (g.format as w.SetFormat | w.SetDraftFormat)._type === formatType).length;
}

// CARDS

/** Yield either all cards for a given user or the most recent cards belonging to any user. */
export async function getCards(uid: w.UserId | null): Promise<w.CardInStore[]> {
  const cardsRef = fb.database().ref('cards');
  const ref = uid ? cardsRef.orderByChild('metadata/ownerId').equalTo(uid) : cardsRef.orderByChild('metadata/updated');
  const snapshot = await ref.once('value');

  if (snapshot) {
    const unnormalizedCards = Object.values(snapshot.val() || {});
    return unnormalizedCards.map((card: any) => normalizeCard(card));
  } else {
    return [];
  }
}

/** Yield the card with the given id. */
export async function getCardById(cardId: string): Promise<w.CardInStore> {
  const snapshot = await fb.database().ref(`cards/${cardId}`).once('value');
  return snapshot.val() as w.CardInStore;
}

/** Yield the N most-recently created cards (with some restrictions, see comments). */
export async function mostRecentCards(uid: w.UserId | null, limit = 9999): Promise<w.CardInStore[]> {
  const cards = await getCards(uid);

  return flow(
    _.uniqBy((c: w.CardInStore) => c.name),
    _.filter((c: w.CardInStore) =>  // Filter out all of the following from carousels:
      !!c.text  // cards without text (uninteresting)
      && !!c.metadata.updated  // cards without timestamp (can't order them)
      && c.metadata.source.type === 'user'  // built-in cards
      && !c.metadata.isPrivate  // private cards
      && !c.metadata.duplicatedFromCard  // duplicated cards
      && !c.metadata.importedFromJson  // cards imported from JSON
      && (c.metadata.source.uid === c.metadata.ownerId)  // cards imported from other players' collections
    ),
    _.orderBy((c: w.CardInStore) => c.metadata.updated, ['desc']),
    _.slice(0, limit)
  )(cards) as w.CardInStore[];
}

/** Save the given card under `/cards`. */
export async function saveCard(card: w.Card): Promise<void> {
  // see firebaseRules.json - this save will only succeed if either:
  //   (i) there is no card yet with the given id
  //   (ii) the card with the given id was created by the logged-in user
  fb.database()
    .ref(`cards/${card.id}`)
    .update(withoutEmptyFields(card));

  // Bring user's cardsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'cardsCreated', await getNumCardsCreatedCountByUserId(currentUser.uid));
  }
}

/** Remove the cards under `/cards` with the corresponding ids. */
export async function removeCards(cardIds: string[]): Promise<void> {
  // Set all card/:cardId to null
  fb.database().ref('cards')
    .update(Object.assign({}, ...cardIds.map((id) => ({ [id]: null }))));

  // Bring user's cardsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'cardsCreated', await getNumCardsCreatedCountByUserId(currentUser.uid));
  }
}

/** Yield the number of cards created by the given user id. */
export async function getNumCardsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('cards', 'metadata/source/uid', userId);
  return snapshot.numChildren();
}

// DECKS

/** Yield all decks belonging to a given user. */
export async function getDecks(uid: w.UserId): Promise<w.DeckInStore[]> {
  return queryObjects<w.DeckInStore>('decks', 'authorId', uid);
}

/** Yield ALL decks.
  * TODO: This is potentially slow and its uses should be deprecated at some point. */
async function getAllDecks_SLOW(): Promise<w.DeckInStore[]> {
  const snapshot = await fb.database().ref('decks').once('value');
  return Object.values(snapshot.val() || {});
}

/** Yield the N cards that are in the most decks. */
export async function getMostUsedCards(n: number): Promise<w.CardInStore[]> {
  const decks: w.DeckInStore[] = await getAllDecks_SLOW();
  const mostPopularCardIds: string[] = flow(
    _.flatMap((d: w.DeckInStore) => uniq(d.cardIds)),
    _.filter((id) => !id.startsWith('builtin/')),
    _.countBy(identity),
    _.toPairs,
    _.orderBy(([_id, count]) => count, 'desc'),
    _.fromPairs,
    _.keys,
    _.slice(0, n),
  )(decks);

  return await Promise.all(mostPopularCardIds.map(getCardById));
}

/** Save the given deck under `/decks`. */
export async function saveDeck(deck: w.DeckInStore): Promise<void> {
  // see firebaseRules.json - this save will only succeed if either:
  //   (i) there is no deck yet with the given id
  //   (ii) the deck with the given id was created by the logged-in user
  fb.database()
    .ref(`decks/${deck.id}`)
    .update(withoutEmptyFields(deck));

  // Bring user's decksCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'decksCreated', await getNumDecksCreatedCountByUserId(currentUser.uid));
  }
}

/** Remove the deck under `/decks` with the given id. */
export async function removeDeck(deckId: string): Promise<void> {
  fb.database().ref(`decks/${deckId}`).remove();

  // Bring user's decksCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'decksCreated', await getNumDecksCreatedCountByUserId(currentUser.uid));
  }
}

/** Updates the given deck's lastUsedTimestamp to the current timestamp. */
export function updateDeckLastUsedTimestamp(deckId: w.DeckId): void {
  fb.database()
    .ref(`decks/${deckId}/lastUsedTimestamp`)
    .set(Date.now());
}

/** Yield the number of decks created by the given user id. */
export async function getNumDecksCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('decks', 'authorId', userId);
  return snapshot.numChildren();
}

/** Yield the number of decks corresponding to the given set id. */
export async function getNumDecksCreatedCountBySetId(setId: string): Promise<number> {
  const snapshot = await query('decks', 'setId', setId);
  return snapshot.numChildren();
}

// SETS

/** Yield all Sets under `/sets`. */
export async function getSets(): Promise<w.Set[]> {
  function deserializeSet(serializedSet: any): w.Set {
    return { ...serializedSet, cards: serializedSet.cards ? Object.values(serializedSet.cards) : [] };
  }

  const snapshot = await fb.database().ref('sets').once('value');
  return snapshot ? Object.values(snapshot.val() || {}).map(deserializeSet) : [];
}

/** Save the given set under `/sets`. */
export async function saveSet(set: w.Set): Promise<void> {
  // see firebaseRules.json - this save will only succeed if either:
  //   (i) there is no set yet with the given id
  //   (ii) the set with the given id is yet unpublished and was created by the logged-in user
  fb.database()
    .ref(`sets/${set.id}`)
    .update(withoutEmptyFields(set));

  // Bring user's setsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'setsCreated', await getNumSetsCreatedCountByUserId(currentUser.uid));
  }
}

/** Remove the set under `/sets` with the given id. */
export async function removeSet(setId: string): Promise<void> {
  fb.database().ref(`sets/${setId}`).remove();

  // Bring user's setsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'setsCreated', await getNumSetsCreatedCountByUserId(currentUser.uid));
  }
}

/** Save the given card under `/sets/:setId/cards`. (This should only be used for parser migration.) */
export async function saveCardInSet(card: w.Card, setId: w.SetId, cardIdx: number): Promise<void> {
  fb.database()
    .ref(`sets/${setId}/cards/${cardIdx}`)
    .update(withoutEmptyFields(card));
}

/** Yield the number of sets created by the given user id. */
export async function getNumSetsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('sets', 'metadata/authorId', userId);
  return snapshot.numChildren();
}

// PARSING-RELATED

interface CardTextInFirebase {
  byToken: {
    [token: string]: string[]
  }
  byNode: {
    [type: string]: {
      [entry: string]: string[]
    }
  }
}

/** Given a list or record of example sentences, return a list of unique, capitalized, whitespace-normalized sentences. */
function cleanupExamples(examples: string[] | Record<string, string>): string[] {
  return uniq(Object.values(examples).map((example) =>
    capitalize(example.replace('\n', '')).trim())
  );
}

/** Yield card text examples from `/cardText/all`, in two formats: as a list of sentences and text corpus. */
export async function getCardTextCorpus(): Promise<{ corpus: string, examples: string[] }> {
  const snapshot = await fb.database().ref('cardText/all').once('value');
  const examples = cleanupExamples(snapshot.val() || {});
  return {
    examples,
    corpus: examples.map((ex) => `${expandKeywords(ex).toLowerCase()} . `).join()
  };
}

/** Assemble all the data used by the dictionary:
  * parser lexicon from the parser and example sentences from Firebase. */
export async function getDictionaryData(): Promise<w.Dictionary> {
  interface Node { type: string, entry: string }

  const definitions: Record<string, any> = await loadParserLexicon();
  const snapshot = await fb.database().ref('cardText').once('value');
  const { byToken, byNode } = (snapshot.val() as CardTextInFirebase) || { byToken: {}, byNode: {} };

  const nodes: Node[] = flatMap(byNode, (entries, type) => Object.keys(entries).map((entry) => ({ type, entry })));
  const byNodeFlat: Record<string, string[]> = fromPairs(nodes.map(({ type, entry }) => [`${type}.${entry}`, byNode[type][entry]]));

  return {
    definitions,
    examplesByToken: mapValues(byToken, cleanupExamples),
    examplesByNode: mapValues(byNodeFlat, cleanupExamples)
  };
}

/** Save a reported parse issue under `/reportedParseIssues`. */
export function saveReportedParseIssue(text: string): void {
  const issue = {
    text,
    date: fb.database.ServerValue.TIMESTAMP,
    user: currentUser?.email
  };

  fb.database().ref('reportedParseIssues').push(issue);
}

/** Given a parsed sentence with metadata, index it under `/cardText/all`, `/cardText/byToken/*`, and `/cardText/byNode/*`. */
export function indexParsedSentence(sentence: string, tokens: string[], js: string): void {
  if (lookupCurrentUser()) {
    const nodes = (js.match(/\w*\['\w*/g) || []).map((n) => n.replace('[\'', '/'));

    const locations = uniq(concat(
      ['cardText/all'],
      tokens.map((t) => `cardText/byToken/${t}`),
      nodes.map((n) => `cardText/byNode/${n}`)
    ));

    locations.forEach((loc) => {
      fb.database().ref(loc).push(sentence);
    });
  }
}
