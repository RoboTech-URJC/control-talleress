// firebase.js
// Modulo de inicializacion de Firebase (v9 modular).

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGpoHsrmvpYFFnBGfcSetHzySI-rsbOvM",
  authDomain: "firmas-talleres.firebaseapp.com",
  projectId: "firmas-talleres",
  storageBucket: "firmas-talleres.firebasestorage.app",
  messagingSenderId: "832359951777",
  appId: "1:832359951777:web:e9f0de32ffb17367086fe0",
  measurementId: "G-YZNPSG345F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, onAuthStateChanged, signInWithEmailAndPassword, signOut };
