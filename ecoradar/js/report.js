import { auth } from "./firebase.js";
console.log("Current user:", auth.currentUser);
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Converttttt coordinates to address
async function getAddressFromCoords(lat, lon) {
  if (!lat || !lon) return "No coordinates available";

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    return data.display_name || `${lat}, ${lon}`;
  } catch (error) {
    console.error("Error fetching address:", error);
    return `${lat}, ${lon}`;
  }
}

// 👤 Get username from the 'users' collection using userId
async function getUsernameFromUserId(userId) {
  if (!userId) return "Unknown";

  try {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.username || userData.name || "Unknown";
    } else {
      return "Unknown";
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Unknown";
  }
}

const reportContainer = document.getElementById("reportCards");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const filterSeverity = document.getElementById("filterSeverity");
const clearFilters = document.getElementById("clearFilters");

let allReports = [];

// Fetch reports in real-time
const q = query(collection(db, "Reports"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
  allReports = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  renderReports(allReports);
});

console.log("Reports fetched:", allReports);

// Render report cards
function renderReports(reports) {
  reportContainer.innerHTML = "";

  reports.forEach(async (r) => {
    const card = document.createElement("div");
    card.classList.add("report-card");

    const lat = r.latitude;
    const lon = r.longitude;
    let addressDisplay =
      r.location || (lat && lon ? `${lat}, ${lon}` : "Unknown");

    card.innerHTML = `
    <img src="${r.imageUrl || "assets/default-image.jpg"}" alt="Report Image">
    <div class="report-card-content">
      <div class="report-header">
        <h3>${r.category || "Unknown"}</h3>
        <select class="status-select" data-id="${r.id}">
          <option value="Pending" ${
            r.status === "Pending" ? "selected" : ""
          }>Pending</option>
          <option value="In Review" ${
            r.status === "In Review" ? "selected" : ""
          }>In Review</option>
          <option value="Resolved" ${
            r.status === "Resolved" ? "selected" : ""
          }>Resolved</option>
        </select>
      </div>
      <div class="report-meta">
        <p><strong>Reporter:</strong> <span class="reporter-name">Loading...</span></p>
        <p><strong>Severity:</strong> ${r.severity || "—"}</p>
        <p><strong>Location:</strong> <span class="address">${addressDisplay}</span></p>
        <p><strong>Description:</strong> ${r.description || "No details."}</p>
        <p><strong>Date:</strong> ${
          r.timestamp?.toDate?.().toLocaleString?.() || "—"
        }</p>
      </div>
      <button class="delete-btn" data-id="${r.id}">Delete</button>
    </div>
  `;

    reportContainer.appendChild(card);

    // 👤 Fetch username from 'users' collection
    if (r.userId) {
      const reporterName = await getUsernameFromUserId(r.userId);
      const nameSpan = card.querySelector(".reporter-name");
      nameSpan.textContent = reporterName;
    } else {
      const nameSpan = card.querySelector(".reporter-name");
      nameSpan.textContent = "Unknown";
    }

    // 🧭 Fetch and replace coordinates with real address asynchronously
    if (lat && lon) {
      const realAddress = await getAddressFromCoords(lat, lon);
      const addressSpan = card.querySelector(".address");
      addressSpan.textContent = realAddress;
    }
  });

  // Add listeners
  document.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      await updateDoc(doc(db, "Reports", id), { status: newStatus });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this report?")) {
        await deleteDoc(doc(db, "Reports", id));
      }
    });
  });
}

// Filters
function filterReports() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusVal = filterStatus.value;
  const categoryVal = filterCategory.value;
  const severityVal = filterSeverity.value;

  const filtered = allReports.filter((r) => {
    const matchesSearch =
      r.reporterName?.toLowerCase().includes(searchTerm) ||
      r.description?.toLowerCase().includes(searchTerm) ||
      r.category?.toLowerCase().includes(searchTerm);

    const matchesStatus = !statusVal || r.status === statusVal;
    const matchesCategory = !categoryVal || r.category === categoryVal;
    const matchesSeverity = !severityVal || r.severity === severityVal;

    return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
  });

  renderReports(filtered);
}

[searchInput, filterStatus, filterCategory, filterSeverity].forEach((el) =>
  el.addEventListener("input", filterReports)
);

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  filterStatus.value = "";
  filterCategory.value = "";
  filterSeverity.value = "";
  renderReports(allReports);
});
