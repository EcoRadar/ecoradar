import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const userTableBody = document.getElementById("userTableBody");

// Reference to the users collection
const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

// Real-time listener for Firestore changes
onSnapshot(q, (snapshot) => {
  userTableBody.innerHTML = "";

  if (snapshot.empty) {
    userTableBody.innerHTML = `
      <tr><td colspan="5" style="text-align:center;">No users found.</td></tr>
    `;
    return;
  }

  snapshot.forEach((doc) => {
    const user = doc.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username || "—"}</td>
      <td>${user.email || "—"}</td>
      <td>${user.phone || "—"}</td>
      <td>${user.role || "user"}</td>
      <td>${
        user.createdAt ? user.createdAt.toDate().toLocaleString() : "—"
      }</td>
    `;

    row.addEventListener("click", () => showUserDetails(doc.id, user));

    userTableBody.appendChild(row);
  });
});

// --------------------
// Modal functionality
// --------------------

function showUserDetails(id, user) {
  document.getElementById("modalUsername").textContent = user.username || "—";
  document.getElementById("modalEmail").textContent = user.email || "—";
  document.getElementById("modalPhone").textContent = user.phone || "—";
  document.getElementById("modalRole").textContent = user.role || "user";
  document.getElementById("modalCreatedAt").textContent = user.createdAt
    ? user.createdAt.toDate().toLocaleString()
    : "—";

  document.getElementById("userModal").classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("userModal").classList.add("hidden");
});
