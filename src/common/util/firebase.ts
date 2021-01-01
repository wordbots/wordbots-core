import { UserCredential } from '@firebase/auth-types';
import * as firebase from 'firebase/app';
import { capitalize, concat, flatMap, fromPairs, mapValues, uniq } from 'lodash';
import { filter, flow, orderBy, slice, uniqBy } from 'lodash/fp';
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
}

// Util functions

/* SELECT * from [ref] WHERE [child] == [value] */
async function query(ref: string, child: string, value: string): Promise<firebase.database.DataSnapshot> {
  return await fb.database()
    .ref(ref)
    .orderByChild(child)
    .equalTo(value)
    .once('value');
}
async function queryObjects<T>(ref: string, child: string, value: string): Promise<T[]> {
  const snapshot = await query(ref, child, value);
  return snapshot?.val() ? Object.values(snapshot.val() as Record<string, T>) : [];
}

// Users

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

export function lookupCurrentUser(): firebase.User | null {
  return currentUser || fb.auth().currentUser;
}

export function lookupUsername(fallback = 'You'): string {
  return currentUser?.displayName || fallback;
}

export function onLogin(callback: (user: firebase.User) => void): firebase.Unsubscribe {
  return fb.auth().onIdTokenChanged((user: firebase.User) => {
    if (user) {
      currentUser = user;
      callback(user);
    }
  });
}

export function onLogout(callback: () => void): firebase.Unsubscribe {
  return fb.auth().onAuthStateChanged((user: firebase.User) => !user && callback());
}

export async function register(email: string, username: string, password: string): Promise<void> {
  const credential: UserCredential = await fb.auth().createUserWithEmailAndPassword(email, password);

  if (credential.user) {
    const { user } = credential;
    await user.updateProfile({ displayName: username, photoURL: null });
    await saveUser(user);
    await fb.auth().currentUser.getIdToken(true); // Refresh current user's ID token so displayName gets displayed
  }
}

export function login(email: string, password: string): Promise<firebase.User> {
  return fb.auth().signInWithEmailAndPassword(email, password);
}

export function logout(): Promise<void> {
  return fb.auth().signOut();
}

export function resetPassword(email: string): Promise<void> {
  return fb.auth().sendPasswordResetEmail(email);
}

export async function getUsers(): Promise<w.User[]> {
  const snapshot = await fb.database().ref('users').once('value');
  return Object.values(snapshot.val());
}

export async function getUserNamesByIds(userIds: string[]): Promise<string[]> {
  const userLookupRefs = userIds.map((userId) => fb.database().ref(`users/${userId}/info/displayName`).once('value'));
  const users = await Promise.all(userLookupRefs);
  return users.map((user) => user.val());
}

export async function getAchievements(): Promise<string[]> {
  const user = lookupCurrentUser();
  if (user) {
    const snapshot = await fb.database().ref(`users/${user.uid}/achievements`).once('value');
    const achievements = snapshot.val();
    return achievements ? Object.keys(achievements) : [];
  }

  return [];
}

export function markAchievement(achievementName: string): void {
  const user = lookupCurrentUser();
  if (user) {
    fb.database()
      .ref(`users/${user.uid}/achievements/${achievementName}`)
      .set(true);
  }
}

async function getStatistics(uid: string): Promise<Record<string, number>> {
  const snapshot = await fb.database().ref(`users/${uid}/statistics`).once('value');
  return snapshot.val() || {};
}

export async function setStatistic(uid: string, statisticName: string, value: number): Promise<void> {
  const statisticRef = fb.database().ref(`users/${uid}/statistics/${statisticName}`);
  statisticRef.set(value);
}

export async function incrementStatistic(statisticName: string): Promise<void> {
  const user = lookupCurrentUser();
  if (user) {
    const statisticRef = fb.database().ref(`users/${user.uid}/statistics/${statisticName}`);
    const currentVal = (await getStatistics(user.uid))[statisticName];
    statisticRef.set((currentVal || 0) + 1);
  }
}

// Games (results)

export function saveGame(game: w.SavedGame): firebase.database.ThenableReference {
  incrementStatistic('gamesPlayed');
  return fb.database().ref('games').push(game);
}

export async function getGamesByUser(userId: w.UserId): Promise<w.SavedGame[]> {
  const blueGames = await queryObjects<w.SavedGame>('games', 'players/blue', userId);
  const orangeGames = await queryObjects<w.SavedGame>('games', 'players/orange', userId);
  return flow(
    uniqBy((g: w.SavedGame) => g.id),
    orderBy('timestamp', 'desc')
  )([...blueGames, ...orangeGames]) as w.SavedGame[];
}

// Cards

/** Returns either all cards for a given user or the most recent cards belonging to any user. */
export async function getCards(uid: w.UserId | null): Promise<w.CardInStore[]> {
  const cardsRef = fb.database().ref('cards');
  const ref = uid ? cardsRef.orderByChild('metadata/ownerId').equalTo(uid) : cardsRef.orderByChild('metadata/updated').limitToLast(50);
  const snapshot = await ref.once('value');

  if (snapshot) {
    const unnormalizedCards = Object.values(snapshot.val() || {});
    return unnormalizedCards.map((card: any) => normalizeCard(card));
  } else {
    return [];
  }
}

export async function getCardById(cardId: string): Promise<w.CardInStore> {
  const snapshot = await fb.database().ref(`cards/${cardId}`).once('value');
  return snapshot.val() as w.CardInStore;
}

export async function mostRecentCards(uid: w.UserId | null, limit: number): Promise<w.CardInStore[]> {
  const cards = await getCards(uid);

  return flow(
    uniqBy((c: w.CardInStore) => c.name),
    filter((c: w.CardInStore) =>  // Filter out all of the following from carousels:
      !!c.text  // cards without text (uninteresting)
        && !!c.metadata.updated  // cards without timestamp (can't order them)
        && c.metadata.source.type === 'user'  // built-in cards
        && !c.metadata.isPrivate  // private cards
        && !c.metadata.duplicatedFrom  // duplicated cards
        && !c.metadata.importedFromJson  // cards imported from JSON
        && (c.metadata.source.uid === c.metadata.ownerId)  // cards imported from other players' collections
    ),
    orderBy((c: w.CardInStore) => c.metadata.updated, ['desc']),
    slice(0, limit)
  )(cards) as w.CardInStore[];
}

export async function saveCard(card: w.Card): Promise<void> {
  fb.database()
    .ref(`cards/${card.id}`)
    .update(withoutEmptyFields(card));  // see firebaseRules.json - this save will only succeed if either:
                                        //   (i) there is no card yet with the given id
                                        //   (ii) the card with the given id was created by the logged-in user

  // Bring user's cardsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'cardsCreated', await getNumCardsCreatedCountByUserId(currentUser.uid));
  }
}

export async function removeCards(cardIds: string[]): Promise<void> {
  // Set all card/:cardId to null
  fb.database().ref('cards')
    .update(Object.assign({}, ...cardIds.map((id) => ({[id]: null}))));

  // Bring user's cardsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'cardsCreated', await getNumCardsCreatedCountByUserId(currentUser.uid));
  }
}

export async function getNumCardsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('cards', 'metadata/source/uid', userId);
  return snapshot.numChildren();
}

// Decks

// Returns all decks belonging to a given user.
export async function getDecks(uid: w.UserId): Promise<w.DeckInStore[]> {
  return queryObjects<w.DeckInStore>('decks', 'authorId', uid);
}

export async function saveDeck(deck: w.DeckInStore): Promise<void> {
  fb.database()
    .ref(`decks/${deck.id}`)
    .update(withoutEmptyFields(deck));  // see firebaseRules.json - this save will only succeed if either:
                                        //   (i) there is no deck yet with the given id
                                        //   (ii) the deck with the given id was created by the logged-in user

  // Bring user's decksCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'decksCreated', await getNumDecksCreatedCountByUserId(currentUser.uid));
  }
}

export async function removeDeck(deckId: string): Promise<void> {
  fb.database().ref(`decks/${deckId}`).remove();

  // Bring user's decksCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'decksCreated', await getNumDecksCreatedCountByUserId(currentUser.uid));
  }
}

export async function getNumDecksCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('decks', 'authorId', userId);
  return snapshot.numChildren();
}

export async function getNumDecksCreatedCountBySetId(setId: string): Promise<number> {
  const snapshot = await query('decks', 'setId', setId);
  return snapshot.numChildren();
}

// Sets

export async function getSets(): Promise<w.Set[]> {
  function deserializeSet(serializedSet: any): w.Set {
    return { ...serializedSet, cards: Object.values(serializedSet.cards) };
  }

  const snapshot = await fb.database().ref('sets').once('value');
  return snapshot ? Object.values(snapshot.val() || {}).map(deserializeSet) : [];
}

export async function saveSet(set: w.Set): Promise<void> {
  fb.database()
    .ref(`sets/${set.id}`)
    .update(withoutEmptyFields(set));  // see firebaseRules.json - this save will only succeed if either:
                                       //   (i) there is no set yet with the given id
                                       //   (ii) the set with the given id is yet unpublished and was created by the logged-in user

  // Bring user's setsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'setsCreated', await getNumSetsCreatedCountByUserId(currentUser.uid));
  }
}

export async function removeSet(setId: string): Promise<void> {
  fb.database().ref(`sets/${setId}`).remove();

  // Bring user's setsCreated statistic up to date
  if (currentUser) {
    setStatistic(currentUser.uid, 'setsCreated', await getNumSetsCreatedCountByUserId(currentUser.uid));
  }
}

export async function getNumSetsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await query('sets', 'metadata/authorId', userId);
  return snapshot.numChildren();
}

// Parsing-related

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

function cleanupExamples(examples: string[]): string[] {
  return uniq(Object.values(examples).map((example) =>
    capitalize(example.replace('\n', '')).trim())
  );
}

export async function getCardTextCorpus(): Promise<{ corpus: string, examples: string[] }> {
  const snapshot = await fb.database().ref('cardText/all').once('value');
  const examples = cleanupExamples(snapshot.val() || {});
  return {
    examples,
    corpus: examples.map((ex) => `${expandKeywords(ex).toLowerCase()} . `).join()
  };
}

export async function getDictionaryData(): Promise<w.Dictionary> {
  interface Node { type: string, entry: string }

  const definitions: Record<string, any> = await loadParserLexicon();
  const snapshot = await fb.database().ref('cardText').once('value');
  const { byToken, byNode } = (snapshot.val() as CardTextInFirebase) || { byToken: {}, byNode: {} };

  const nodes: Node[] = flatMap(byNode, (entries, type) => Object.keys(entries).map((entry) => ({ type, entry })));
  const byNodeFlat: Record<string, string[]> = fromPairs(nodes.map(({ type, entry }) => [`${type}.${entry}`, byNode[type][entry]] ));

  return {
    definitions,
    examplesByToken: mapValues(byToken, cleanupExamples),
    examplesByNode: mapValues(byNodeFlat, cleanupExamples)
  };
}

export function saveReportedParseIssue(text: string): void {
  const issue = {
    text,
    date: fb.database.ServerValue.TIMESTAMP,
    user: currentUser?.email
  };

  fb.database().ref('reportedParseIssues').push(issue);
}

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
