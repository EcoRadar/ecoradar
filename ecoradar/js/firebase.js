import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpAQEqN9Nf64sBCoaWLJ-Pnsner5gtmUE",
  authDomain: "ecoradar1.firebaseapp.com",
  projectId: "ecoradar1",
  storageBucket: "ecoradar1.firebasestorage.app",
  messagingSenderId: "450670057366",
  appId: "1:450670057366:web:9ae2cc41d67cd6ec746fb7",
  measurementId: "G-DL3P8RJPXY",
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
