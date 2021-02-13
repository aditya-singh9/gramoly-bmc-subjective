import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const app = firebase.initializeApp({
  apiKey: "AIzaSyBUEgFlC8TfZ4Yi5cPNnO9-GHm8kpbEBzk",
  authDomain: "gramolybmc.firebaseapp.com",
  projectId: "gramolybmc",
  storageBucket: "gramolybmc.appspot.com",
  messagingSenderId: "515578685707",
  appId: "1:515578685707:web:7d75b230ac1dec057e9a0e",
  measurementId: "G-15F7PLZ5C8",
});

const firestore = app.firestore();
export const database = {
  folders: firestore.collection("folders"),
  files: firestore.collection("files"),
  formatDoc: (doc) => {
    return { id: doc.id, ...doc.data() };
  },
  getCurrentTimestamp: firebase.firestore.FieldValue.serverTimestamp,
};
export const storage = app.storage();
export const auth = app.auth();
export default app;
