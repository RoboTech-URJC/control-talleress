// firebase.js
// Módulo de inicialización de Firebase (v9 modular).
// Rellena firebaseConfig con tus credenciales (apiKey, authDomain, projectId, ...)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
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

export { db, auth, signInWithEmailAndPassword, signOut };
