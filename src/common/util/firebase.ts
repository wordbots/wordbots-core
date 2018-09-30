import { Unsubscribe, User } from 'firebase/app';
import { capitalize, concat, flatMap, fromPairs, mapValues, noop, uniq, isNil } from 'lodash';

const firebase = import(/* webpackChunkName: 'firebase' */ 'firebase').then((_fb) => {
  if (_fb.apps.length === 0) {
    _fb.initializeApp(config);
  }

  return _fb;
});

import * as w from '../types';

import { expandKeywords, loadParserLexicon } from './cards';

const config = {
  apiKey: 'AIzaSyD6XsL6ViMw8_vBy6aU7Dj9F7mZJ8sxcUA',
  authDomain: 'wordbots.firebaseapp.com',
  databaseURL: 'https://wordbots.firebaseio.com',
  projectId: 'wordbots',
  storageBucket: 'wordbots.appspot.com',
  messagingSenderId: '913868073872'
};

let currentUser: User | null = null;

async function importFirebase(): Promise<any> {
  await firebase;
  return firebase;
}

// Users

function saveUser(user: User): Promise<User> {
  return importFirebase().then((fb) => (
    fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    })
    .then(() => user)
  ));
}

export function getLoggedInUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    importFirebase().then((fb) => (
      fb.auth().onAuthStateChanged((user: User) => {
        currentUser = user;
        if (user) {
          resolve(user);
        } else {
          reject('Not logged in');
        }
      })
    ));
  });
}

export function lookupUsername(fallback = 'You'): string {
  return (currentUser && currentUser.displayName) || fallback;
}

export function onLogin(callback: (user: User) => any): Promise<Unsubscribe> {
  return importFirebase().then((fb) => (
    fb.auth().onAuthStateChanged((user: User) => user && callback(user))
  ));
}

export function onLogout(callback: () => any): Promise<Unsubscribe> {
  return importFirebase().then((fb) => (
    fb.auth().onAuthStateChanged((user: User) => !user && callback())
  ));
}

export function register(email: string, username: string, password: string): Promise<void> {
  function postRegister(user: User): Promise<void> {
    return user.updateProfile({ displayName: username, photoURL: null })
               .then(() => { saveUser(user); })
               .catch(noop);
  }

  return importFirebase().then((fb) => (
    fb.auth().createUserWithEmailAndPassword(email, password)
      .then(postRegister)
      .catch(noop)
  ));
}

export function login(email: string, password: string): Promise<User> {
  return importFirebase().then((fb) => (
    fb.auth().signInWithEmailAndPassword(email, password)
  ));
}

export function logout(): Promise<void> {
  return importFirebase().then((fb) => (
    fb.auth().signOut()
  ));
}

export function resetPassword(email: string): Promise<void> {
  return importFirebase().then((fb) => (
    fb.auth().sendPasswordResetEmail(email)
  ));
}

export function listenToUserData(callback: (data: any) => any): Promise<void> {
  return getLoggedInUser().then((user) => {
    fb.database()
      .ref(`users/${user.uid}`)
      .on('value', (snapshot: firebase.database.DataSnapshot) => {
        if (snapshot) {
          callback(snapshot.val());
        }
      });
  });
}

export function listenToUserDataById(uid: string, callback: (data: any) => any): void {
  fb.database()
    .ref(`users/${uid}`)
    .on('value', (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot) {
        callback(snapshot.val());
      }
    });
}

export function saveUserData(key: string, value: any): void {
  return importFirebase().then((fb) => (
  getLoggedInUser()
    .then((user) => {
      fb.database()
        .ref(`users/${user.uid}/${key}`)
        .set(value);
    })
    .catch(noop);
}

export async function getUserNamesByIds(userIds: Array<string>): Promise<string[]> {
  const userLookupRefs = userIds.map((userId) => fb.database().ref(`users/${userId}`).once('value'));
  const users = await Promise.all(userLookupRefs);
  return users.map((user) => user.val().info.displayName);
}

// Game results

export function saveGame(game: w.SavedGame): firebase.database.ThenableReference {
  return fb.database().ref('games').push(game);
}

// Cards and text

export function listenToRecentCards(callback: (data: any) => any, uid?: string): void {
  fb.database()
    .ref(isNil(uid) ? 'recentCards' : `users/${uid}/cards`)
    .orderByChild('timestamp')
    .limitToLast(50)
    .on('value', (snapshot: firebase.database.DataSnapshot) => {
      if (snapshot) {
        callback(snapshot.val());
      }
    });
}

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

export function saveRecentCard(card: w.Card): void {
  fb.database()
    .ref('recentCards')
    .push(card);
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
  getLoggedInUser()
    .then(() => {
      const nodes = (js.match(/\w*\['\w*/g) || []).map((n) => n.replace('[\'', '/'));

      const locations = uniq(concat(
        ['cardText/all'],
        tokens.map((t) => `cardText/byToken/${t}`),
        nodes.map((n) => `cardText/byNode/${n}`)
      ));

      locations.forEach((loc) => {
        fb.database().ref(loc).push(sentence);
      });
    })
    .catch(noop);
}

export async function getRecentGamesByUserId(userId: string): Promise<w.SavedGame[]> {
  const blueGames = await getRecentGamesForColorByUserId(userId, 'blue');
  const orangeGames = await getRecentGamesForColorByUserId(userId, 'orange');
  return Object.values({...blueGames, ...orangeGames});
}

async function getRecentGamesForColorByUserId(userId: string, color: string): Promise<Record<string, w.SavedGame>> {
  const snapshot = await fb.database()
    .ref('games')
    .orderByChild(`players/${color}`)
    .equalTo(userId)
    .once('value');
  return snapshot.val();
}

export async function getCardsCreatedCountByUserId(userId: string): Promise<number> {
  const snapshot = await fb.database()
    .ref(`users/${userId}/cards`)
    .once('value');
  return snapshot.numChildren();
}

export async function getDecksCreatedCountByUserId(userId: string): Promise<number> {
  const snapshot = await fb.database()
    .ref(`users/${userId}/decks`)
    .once('value');
  return snapshot.numChildren();
}
