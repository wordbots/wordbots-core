import fb from 'firebase';
import { capitalize, concat, flatMap, fromPairs, mapValues, noop, uniq } from 'lodash';

import { expandKeywords, loadParserLexicon } from './cards';

const config = {
  apiKey: 'AIzaSyD6XsL6ViMw8_vBy6aU7Dj9F7mZJ8sxcUA',
  authDomain: 'wordbots.firebaseapp.com',
  databaseURL: 'https://wordbots.firebaseio.com',
  projectId: 'wordbots',
  storageBucket: 'wordbots.appspot.com',
  messagingSenderId: '913868073872'
};

let currentUser = null;

if (fb.apps.length === 0) {
  fb.initializeApp(config);
}

function saveUser(user) {
  return fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    })
    .then(() => user);
}

export function saveRating(user) {
    return fb.database().ref()
        .child(`users/${user.uid}/stats`)
        .set({
            uid: user.uid,
            rating: user.rating
            })
        .then(() => user);
}

export function saveGame(game) {
    return fb.database().ref()
        .child(`games/${game.id}/info`)
        .set({
            game: game
        })
        .then(() => game);
}

export function getLoggedInUser() {
  return new Promise((resolve, reject) => {
    fb.auth().onAuthStateChanged(user => {
      currentUser = user;
      if (user) {
        resolve(user);
      } else {
        reject('Not logged in');
      }
    });
  });
}

export function onLogin(callback) {
  return fb.auth().onAuthStateChanged(user => user && callback(user));
}

export function onLogout(callback) {
  return fb.auth().onAuthStateChanged(user => !user && callback());
}

export function register(email, username, password) {
  function postRegister(user) {
    return user.updateProfile({displayName: username})
               .then(() => { saveUser(user); })
               .catch(noop);
  }

  return fb.auth().createUserWithEmailAndPassword(email, password)
    .then(postRegister)
    .catch(noop);
}

export function login(email, password) {
  return fb.auth().signInWithEmailAndPassword(email, password);
}

export function logout() {
  return fb.auth().signOut();
}

export function resetPassword(email) {
  return fb.auth().sendPasswordResetEmail(email);
}

export function listenToUserData(callback) {
  return getLoggedInUser().then(user => {
    fb.database()
      .ref(`users/${user.uid}`)
      .on('value', (snapshot) => { callback(snapshot.val()); });
  });
}

export function listenToUserDataById(uid, callback) {
    return fb.database()
        .ref(`users/${uid}`)
        .on('value', (snapshot) => { callback(snapshot.val()); });
}

export function listenToRecentCards(callback) {
  return fb.database()
           .ref('recentCards')
           .orderByChild('timestamp')
           .limitToLast(50)
           .on('value', (snapshot) => { callback(snapshot.val()); });
}

function cleanupExamples(examples) {
  return uniq(Object.values(examples).map(example =>
    capitalize(example.replace('\n', '')).trim())
  );
}

export function getCardTextCorpus(callback) {
  fb.database()
    .ref('cardText/all')
    .once('value', (snapshot) => {
      const examples = cleanupExamples(snapshot.val());
      const corpus = examples.map(ex => `${expandKeywords(ex).toLowerCase()} . `).join();
      callback(corpus, examples);
    });
}

export function listenToDictionaryData(callback) {
  loadParserLexicon(json => {
    callback({
      dictionary: {
        definitions: json
      }
    });
  });

  fb.database()
    .ref('cardText')
    .on('value', (snapshot) => {
      const val = snapshot.val();

      const examplesByToken = val.byToken;

      const nodes = flatMap(val.byNode, ((entries, type) => Object.keys(entries).map(entry => `${type}.${entry}`)));
      const examplesByNode = fromPairs(nodes.map(n => [n, val.byNode[n.split('.')[0]][n.split('.')[1]]]));

      callback({
        dictionary: {
          examplesByToken: mapValues(examplesByToken, cleanupExamples),
          examplesByNode: mapValues(examplesByNode, cleanupExamples)
        }
      });
    });
}

export function saveUserData(key, value) {
  getLoggedInUser()
    .then(user => {
      fb.database()
        .ref(`users/${user.uid}/${key}`)
        .set(value);
    })
    .catch(noop);
}

export function saveRecentCard(card) {
  fb.database()
    .ref('recentCards')
    .push(card);
}

export function saveReportedParseIssue(text) {
  fb.database()
    .ref('reportedParseIssues')
    .push({
      text,
      date: fb.database.ServerValue.TIMESTAMP,
      user: currentUser && currentUser.email
    });
}

export function indexParsedSentence(sentence, tokens, js) {
  getLoggedInUser()
    .then(() => {
      const nodes = js.match(/\w*\['\w*/g).map(n => n.replace('[\'', '/'));

      const locations = uniq(concat(
        ['cardText/all'],
        tokens.map(t => `cardText/byToken/${t}`),
        nodes.map(n => `cardText/byNode/${n}`)
      ));

      locations.forEach(loc => {
        fb.database().ref(loc).push(sentence);
      });
    })
    .catch(noop);
}
