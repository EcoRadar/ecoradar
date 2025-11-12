import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const notificationsList = document.getElementById("notificationsList");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    notificationsList.innerHTML = "<p>Please log in to view notifications.</p>";
    return;
  }

  const adminId = user.uid;

  // Query only this admin’s notifications
  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", adminId),
    orderBy("timestamp", "desc")
  );

  // Real-time listener
  onSnapshot(q, (snapshot) => {
    notificationsList.innerHTML = "";

    if (snapshot.empty) {
      notificationsList.innerHTML = "<p>No notifications yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const notif = docSnap.data();
      const notifId = docSnap.id;

      const notifItem = document.createElement("div");
      notifItem.classList.add("notif-item");
      if (notif.status === "unread") notifItem.classList.add("unread");

      notifItem.innerHTML = `
        <div class="notif-icon">${notif.status === "unread" ? "🔔" : "📩"}</div>
        <div class="notif-content">
          <p>${
            notif.status === "unread"
              ? `<strong>${notif.message}</strong>`
              : notif.message
          }</p>
          <small>${
            notif.timestamp?.toDate
              ? notif.timestamp.toDate().toLocaleString()
              : "—"
          }</small>
        </div>
      `;

      notifItem.addEventListener("click", async () => {
        if (notif.status === "unread") {
          try {
            await updateDoc(doc(db, "notifications", notifId), {
              status: "read",
            });
            notifItem.classList.remove("unread");
            notifItem.querySelector(".notif-icon").textContent = "📩";
            notifItem.querySelector(".notif-content p").innerHTML =
              notif.message;
          } catch (error) {
            console.error("Failed to mark notification as read:", error);
          }
        }
      });

      notificationsList.appendChild(notifItem);
    });
  });
});
