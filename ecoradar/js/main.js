// main.js
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --------------------------- SIDEBAR NAVIGATION---------------------------------
var menuItems = document.querySelectorAll(".sidebar ul li[data-section]");
var sections = document.querySelectorAll(".content-section");

menuItems.forEach(function (item) {
  item.addEventListener("click", function () {
    menuItems.forEach(function (i) {
      i.classList.remove("active");
    });
    item.classList.add("active");

    var target = item.getAttribute("data-section");
    sections.forEach(function (section) {
      section.classList.remove("active");
      if (section.id === target) {
        section.classList.add("active");
      }
    });
  });
});

// -------------------------------------- REPORT SEARCH-------------------------------------------
// $(document).ready(function () {
//   $("#search_button").on("click", function () {
//     var value = $("#report_input").val().toLowerCase();
//     $("#report_table tr").filter(function () {
//       $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
//     });
//   });
// });

// ------------------------------- DASHBOARD REAL-TIME REPORTS-----------------------------------

// Get card and table elements
const pendingCountEl = document.getElementById("pendingCount");
const inReviewCountEl = document.getElementById("inReviewCount");
const fixedCountEl = document.getElementById("fixedCount");
const urgentCountEl = document.getElementById("urgentCount");
const recentReportsEl = document.getElementById("recentReports");

// Firestore listener for the "reports" collection
onSnapshot(collection(db, "reports"), (snapshot) => {
  let pending = 0;
  let inReview = 0;
  let fixed = 0;
  let urgent = 0;
  const reports = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Count by status
    if (data.status === "Pending") pending++;
    else if (data.status === "In Review") inReview++;
    else if (data.status === "Fixed") fixed++;
    else if (data.status === "Urgent") urgent++;

    // Push for recent table
    reports.push({
      id: doc.id,
      reporter: data.reporterName || "Unknown",
      location: data.location || "N/A",
      date: data.date || "—",
      category: data.category || "N/A",
      severity: data.severity || "—",
      status: data.status || "—",
    });
  });

  // Update card counts
  pendingCountEl.textContent = pending;
  inReviewCountEl.textContent = inReview;
  fixedCountEl.textContent = fixed;
  urgentCountEl.textContent = urgent;

  // Sort by date (newest first)
  reports.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Show 5 latest
  const latest = reports.slice(0, 5);

  // Rebuild the table
  recentReportsEl.innerHTML = latest
    .map(
      (r) => `
      <tr>
        <td>${r.id}</td>
        <td>${r.reporter}</td>
        <td>${r.location}</td>
        <td>${r.date}</td>
        <td>${r.category}</td>
        <td>${r.severity}</td>
        <td>${r.status}</td>
      </tr>
    `
    )
    .join("");
});
