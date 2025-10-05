import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

import firebaseConfig from './firebaseConfig';
firebase.initializeApp(firebaseConfig);

var db = firebase.database();

if (location.hostname === "localhost") {
  // Point to the RTDB emulator running on localhost.
  db.useEmulator("localhost", 9000);
}

export default db;