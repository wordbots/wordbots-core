const fb = require('firebase/app').default;
import { capitalize, concat, flatMap, fromPairs, mapValues, noop, uniq } from 'lodash';

import 'firebase/auth';
import 'firebase/database';

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

let currentUser: fb.User | null = null;

if (fb.apps.length === 0) {
  fb.initializeApp(config);
}

// Users

function saveUser(user: fb.User): Promise<fb.User> {
  return fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    })
    .then(() => user);
}

export function getLoggedInUser(): Promise<fb.User> {
  return new Promise((resolve, reject) => {
    fb.auth().onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        resolve(user);
      } else {
        reject('Not logged in');
      }
    });
  });
}

export function lookupUsername(fallback = 'You'): string {
  return (currentUser && currentUser.displayName) || fallback;
}

export function onLogin(callback: (user: fb.User) => any): fb.Unsubscribe {
  return fb.auth().onAuthStateChanged((user) => user && callback(user));
}

export function onLogout(callback: () => any): fb.Unsubscribe {
  return fb.auth().onAuthStateChanged((user) => !user && callback());
}

export function register(email: string, username: string, password: string): Promise<void> {
  function postRegister(user: fb.User): Promise<void> {
    return user.updateProfile({ displayName: username, photoURL: null })
               .then(() => { saveUser(user); })
               .catch(noop);
  }

  return fb.auth().createUserWithEmailAndPassword(email, password)
    .then(postRegister)
    .catch(noop);
}

export function login(email: string, password: string): Promise<fb.User> {
  return fb.auth().signInWithEmailAndPassword(email, password);
}

export function logout(): Promise<void> {
  return fb.auth().signOut();
}

export function resetPassword(email: string): Promise<void> {
  return fb.auth().sendPasswordResetEmail(email);
}

export function listenToUserData(callback: (data: any) => any): Promise<void> {
  return getLoggedInUser().then((user) => {
    fb.database()
      .ref(`users/${user.uid}`)
      .on('value', (snapshot) => {
        if (snapshot) {
          callback(snapshot.val());
        }
      });
  });
}

export function listenToUserDataById(uid: string, callback: (data: any) => any): void {
  fb.database()
    .ref(`users/${uid}`)
    .on('value', (snapshot) => {
      if (snapshot) {
        callback(snapshot.val());
      }
    });
}

export function saveUserData(key: string, value: any): void {
  getLoggedInUser()
    .then((user) => {
      fb.database()
        .ref(`users/${user.uid}/${key}`)
        .set(value);
    })
    .catch(noop);
}

// Game results

export function saveGame(game: w.SavedGame): fb.database.ThenableReference {
  return fb.database().ref('games').push(game);
}

// Cards and text

export function listenToRecentCards(callback: (data: any) => any): void {
  fb.database()
    .ref('recentCards')
    .orderByChild('timestamp')
    .limitToLast(50)
    .on('value', (snapshot) => {
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
    .once('value', (snapshot) => {
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
    .on('value', (snapshot) => {
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
