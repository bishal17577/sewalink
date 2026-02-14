// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVYHKeB4TXobILCAygM8JIVisKqUGiJ1s",
  authDomain: "sewalink-ead02.firebaseapp.com",
  projectId: "sewalink-ead02",
  storageBucket: "sewalink-ead02.firebasestorage.app",
  messagingSenderId: "682952754486",
  appId: "1:682952754486:web:c0bba16496d78234aa1f97",
  measurementId: "G-44SGGSRS04"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };