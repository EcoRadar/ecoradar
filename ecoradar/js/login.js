import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check Admin Role
    const adminRef = doc(db, "admin", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists() && adminSnap.data().role === "admin") {
      message.style.color = "green";
      message.textContent = "Login successful! Redirecting...";
      setTimeout(() => {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("dashboard").style.display = "flex";
      }, 1000);
    } else {
      message.textContent = "Access denied. Not an admin.";
      await signOut(auth);
    }
  } catch (error) {
    console.error("Login error:", error.message);
    message.style.color = "red";
    message.textContent = "Login failed: " + error.message;
  }
});

// Logout Function
window.logout = async function () {
  await signOut(auth);
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("loginMessage").textContent = "";
};
