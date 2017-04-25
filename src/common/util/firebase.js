import fb from 'firebase';

const config = {
  apiKey: 'AIzaSyD6XsL6ViMw8_vBy6aU7Dj9F7mZJ8sxcUA',
  authDomain: 'wordbots.firebaseapp.com',
  databaseURL: 'https://wordbots.firebaseio.com',
  projectId: 'wordbots',
  storageBucket: 'wordbots.appspot.com',
  messagingSenderId: '913868073872'
};

fb.initializeApp(config);

function saveUser(user) {
  return fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      email: user.email,
      uid: user.uid
    })
    .then(() => user);
}

function getLoggedInUser() {
  return new Promise((resolve, reject) => {
    fb.auth().onAuthStateChanged(user => {
      if (user) {
        resolve(user);
      } else {
        reject('Not logged in');
      }
    });
  });
}

export function onLogin(callback) {
  return fb.auth().onAuthStateChanged(user => user && callback());
}

export function onLogout(callback) {
  return fb.auth().onAuthStateChanged(user => !user && callback());
}

export function register(email, pw) {
  return fb.auth().createUserWithEmailAndPassword(email, pw)
    .then(saveUser);
}

export function login(email, pw) {
  return fb.auth().signInWithEmailAndPassword(email, pw);
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

export function saveUserData(key, value) {
  getLoggedInUser().then(user => {
    fb.database()
      .ref(`users/${user.uid}/${key}`)
      .set(value);
  });
}
