// --- Import Firebase references ---
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --- Global variables ---
let map;
let markers = {}; // Store active markers by report ID

// --- Define and export initMap ---
export function initMap() {
  window.mapInitialized = true;
  console.log("✅ Google Maps API loaded, initializing map...");

  const mapContainer = document.getElementById("map-report");
  if (!mapContainer) {
    console.error("❌ map-report element not found!");
    return;
  }

  map = new google.maps.Map(mapContainer, {
    center: { lat: 7.1907, lng: 125.4553 },
    zoom: 12,
    mapId: "35e2711ea75c1d5b175bef8d",
  });

  listenForReports();
}

// --- Firestore listener ---
function listenForReports() {
  const reportsRef = collection(db, "Reports");

  onSnapshot(reportsRef, (snapshot) => {
    // Remove old markers
    Object.values(markers).forEach((m) => (m.map = null));
    markers = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.latitude || !data.longitude) return;

      const { AdvancedMarkerElement } = google.maps.marker;

      const marker = new AdvancedMarkerElement({
        position: { lat: data.latitude, lng: data.longitude },
        map,
        title: data.category || "Report",
        content: createCustomMarkerContent(data),
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(data),
      });

      marker.addListener("click", () => infoWindow.open(map, marker));
      markers[doc.id] = marker;
    });
  });
}

// --- Create marker icon based on severity ---
function createCustomMarkerContent(data) {
  const color = getMarkerColor(data.severity);
  const div = document.createElement("div");
  div.className = "custom-marker";
  div.style.backgroundColor = color;
  return div;
}

function getMarkerColor(severity) {
  switch (severity) {
    case "High":
    case "Urgent":
      return "#e74c3c"; // red
    case "Moderate":
      return "#f39c12"; // orange
    case "Low":
      return "#2ecc71"; // green
    default:
      return "#3498db"; // blue
  }
}

// --- Create InfoWindow content ---
function createInfoWindowContent(data) {
  return `
    <div class="info-window">
      <strong>${data.name || "Unknown Reporter"}</strong><br>
      <em>${data.category || "No Category"}</em><br>
      Severity: ${data.severity || "N/A"}<br>
      <p>${(data.description || "").substring(0, 80)}...</p>
      <p class="info-location">${data.location || "Unknown location"}</p>
    </div>
  `;
}
