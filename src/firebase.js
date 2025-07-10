// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZ7qTYkAC150QNPEGo8Q9eGj-2JqAApBM",
  authDomain: "sfhl-da375.firebaseapp.com",
  projectId: "sfhl-da375",
  storageBucket: "sfhl-da375.firebasestorage.app",
  messagingSenderId: "562240311761",
  appId: "1:562240311761:web:0bae1f61ee532668bd50f0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
