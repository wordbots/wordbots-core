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

export const auth = fb.auth;

export function register(email, pw) {
  return auth().createUserWithEmailAndPassword(email, pw)
    .then(saveUser);
}

export function logout() {
  return auth().signOut();
}

export function login(email, pw) {
  return auth().signInWithEmailAndPassword(email, pw);
}

export function resetPassword(email) {
  return auth().sendPasswordResetEmail(email);
}

function saveUser(user) {
  return fb.database().ref()
    .child(`users/${user.uid}/info`)
    .set({
      email: user.email,
      uid: user.uid
    })
    .then(() => user);
}
