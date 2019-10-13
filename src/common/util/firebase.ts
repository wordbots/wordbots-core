import { UserCredential } from '@firebase/auth-types';
import * as firebase from 'firebase/app';
import { capitalize, concat, flatMap, fromPairs, mapValues, orderBy, uniq, uniqBy } from 'lodash';

const fb = require('firebase/app').default;
import 'firebase/auth';
import 'firebase/database';

import * as w from '../types';

import { expandKeywords, loadParserLexicon, normalizeCard } from './cards';
import { withoutEmptyFields } from './common';

const config = {
  apiKey: 'AIzaSyD6XsL6ViMw8_vBy6aU7Dj9F7mZJ8sxcUA',  // Note that this is the client API key, with very limited permissions
  authDomain: 'wordbots.firebaseapp.com',
  databaseURL: 'https://wordbots.firebaseio.com',
  projectId: 'wordbots',
  storageBucket: 'wordbots.appspot.com',
  messagingSenderId: '913868073872'
};

let currentUser: firebase.User | null = null;

if (fb.apps.length === 0) {
  fb.initializeApp(config);
  // (window as any).fb = fb;
}

function listenWithUnsubscribe(ref: firebase.database.Reference, cb: (snapshot: firebase.database.DataSnapshot | null) => void): firebase.Unsubscribe {
  ref.on('value', cb);
  return () => ref.off('value', cb);
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
  return currentUser;
}

export function lookupUsername(fallback = 'You'): string {
  return (currentUser && currentUser.displayName) || fallback;
}

export function onLogin(callback: (user: firebase.User) => any): firebase.Unsubscribe {
  return fb.auth().onIdTokenChanged((user: firebase.User) => {
    if (user) {
      currentUser = user;
      callback(user);
    }
  });
}

export function onLogout(callback: () => any): firebase.Unsubscribe {
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

export async function getUserNamesByIds(userIds: string[]): Promise<string[]> {
  const userLookupRefs = userIds.map((userId) => fb.database().ref(`users/${userId}/info/displayName`).once('value'));
  const users = await Promise.all(userLookupRefs);
  return users.map((user) => user.val());
}

// Games (results)

export function saveGame(game: w.SavedGame): firebase.database.ThenableReference {
  return fb.database().ref('games').push(game);
}

export async function getRecentGamesByUserId(userId: w.UserId): Promise<w.SavedGame[]> {
  async function gamesByColor(color: string): Promise<w.SavedGame[]> {
    const snapshot = await fb.database()
      .ref('games')
      .orderByChild(`players/${color}`)
      .equalTo(userId)
      .once('value');
    return Object.values(snapshot.val());
  }

  const blueGames = await gamesByColor('blue');
  const orangeGames = await gamesByColor('orange');
  return orderBy(uniqBy([...blueGames, ...orangeGames], 'id'), ['timestamp'], ['desc']);
}

// Cards

/** Returns either all cards for a given user or the most recent cards belonging to any user. */
export function listenToCards(uid: w.UserId | null, callback: (data: w.CardInStore[]) => any): firebase.Unsubscribe {
  const ref = uid
    ? fb.database().ref('cards').orderByChild('metadata/ownerId').equalTo(uid)
    : fb.database().ref('cards').orderByChild('metadata/updated').limitToLast(50);

  return listenWithUnsubscribe(ref, (snapshot: firebase.database.DataSnapshot | null) => {
    if (snapshot) {
      const unnormalizedCards = Object.values(snapshot.val());
      const normalizedCards = unnormalizedCards.map((card: any) => normalizeCard(card));
      callback(normalizedCards);
    }
  });
}

export function saveCard(card: w.Card): void {
  fb.database()
    .ref(`cards/${card.id}`)
    // see firebaseRules.json - this save will only succeed if either:
    //   (i) there is no card yet with the given id
    //   (ii) the card with the given id was created by the logged-in user
    .update(withoutEmptyFields(card));
}

export function removeCards(cardIds: string[]): void {
  // Set all card/:cardId to null
  fb.database().ref(`cards`)
    .update(Object.assign({}, ...cardIds.map((id) => ({[id]: null}))));
}

export async function getCardById(cardId: string): Promise<w.CardInStore> {
  const snapshot = await fb.database().ref(`cards/${cardId}`).once('value');
  return snapshot.val() as w.CardInStore;
}

export async function getNumCardsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await fb.database()
    .ref('cards')
    .orderByChild('metadata/source/uid')
    .equalTo(userId)
    .once('value');
  return snapshot.numChildren();
}

// Decks

// Returns either all decks belonging to a given user.
export function listenToDecks(uid: w.UserId, callback: (data: w.DeckInStore[]) => any): void {
  fb.database()
    .ref('decks')
    .orderByChild('authorId')
    .equalTo(uid)
    .on('value', (snapshot: firebase.database.DataSnapshot) => {
      try {
        if (snapshot) {
          callback(Object.values(snapshot.val()) as w.DeckInStore[]);
        }
      } catch (ex) {
        callback([]);
      }
    });
}

export function saveDeck(deck: w.DeckInStore): void {
  fb.database()
    .ref(`decks/${deck.id}`)
    .update(withoutEmptyFields(deck));  // see firebaseRules.json - this save will only succeed if either:
                                        //   (i) there is no deck yet with the given id
                                        //   (ii) the deck with the given id was created by the logged-in user
}

export function removeDeck(deckId: string): void {
  fb.database().ref(`decks/${deckId}`).remove();
}

export async function getNumDecksCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await fb.database()
    .ref('decks')
    .orderByChild('authorId')
    .equalTo(userId)
    .once('value');
  return snapshot.numChildren();
}

export async function getNumDecksCreatedCountBySetId(setId: string): Promise<number> {
  const snapshot = await fb.database()
    .ref('decks')
    .orderByChild('setId')
    .equalTo(setId)
    .once('value');
  return snapshot.numChildren();
}

// Sets

export function listenToSets(callback: (data: w.Set[]) => any): void {
  const deserializeSet = (serializedSet: any): w.Set => ({
    ...serializedSet,
    cards: Object.values(serializedSet.cards)
  });

  fb.database()
    .ref('sets')
    .on('value', (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot) {
        const serializedSets = Object.values(snapshot.val());
        callback(serializedSets.map(deserializeSet));
      }
    });
}

export function saveSet(set: w.Set): void {
  fb.database()
    .ref(`sets/${set.id}`)
    .update(withoutEmptyFields(set));  // see firebaseRules.json - this save will only succeed if either:
                                       //   (i) there is no set yet with the given id
                                       //   (ii) the set with the given id is yet unpublished and was created by the logged-in user
}

export function removeSet(setId: string): void {
  fb.database().ref(`sets/${setId}`).remove();
}

export async function getNumSetsCreatedCountByUserId(userId: w.UserId): Promise<number> {
  const snapshot = await fb.database()
    .ref('sets')
    .orderByChild('metadata/authorId')
    .equalTo(userId)
    .once('value');
  return snapshot.numChildren();
}

// Parsing-related

function cleanupExamples(examples: string[]): string[] {
  return uniq(Object.values(examples).map((example) =>
    capitalize(example.replace('\n', '')).trim())
  );
}

export function getCardTextCorpus(callback: (corpus: string, examples: string[]) => any): void {
  fb.database()
    .ref('cardText/all')
    .once('value', (snapshot: firebase.database.DataSnapshot) => {
      const examples = cleanupExamples(snapshot.val());
      const corpus = examples.map((ex) => `${expandKeywords(ex).toLowerCase()} . `).join();
      callback(corpus, examples);
    });
}

export function listenToDictionaryData(callback: (data: { dictionary: w.Dictionary }) => any): void {
  loadParserLexicon((json: { [token: string]: any }) => {
    callback({
      dictionary: {
        definitions: json
      }
    });
  });

  fb.database()
    .ref('cardText')
    .on('value', (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot) {
        const val = snapshot.val();

        const examplesByToken: { [token: string]: string[] } = val.byToken;

        const nodes = flatMap(val.byNode, ((entries, type) => Object.keys(entries).map((entry) => `${type}.${entry}`)));
        const examplesByNode: { [token: string]: string[] } = fromPairs(nodes.map((n) =>
          [n, val.byNode[n.split('.')[0]][n.split('.')[1]]]
        ));

        callback({
          dictionary: {
            examplesByToken: mapValues(examplesByToken, cleanupExamples),
            examplesByNode: mapValues(examplesByNode, cleanupExamples)
          }
        });
      }
    });
}

export function saveReportedParseIssue(text: string): void {
  fb.database()
    .ref('reportedParseIssues')
    .push({
      text,
      date: fb.database.ServerValue.TIMESTAMP,
      user: currentUser && currentUser.email
    });
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
