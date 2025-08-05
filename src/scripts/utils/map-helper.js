/**
 * Map helper functions for location handling
 */

/**
 * Loads Leaflet resources (CSS and JS) if they aren't already loaded
 * @returns {Promise} Resolves when Leaflet is ready to use
 */
export const loadLeafletResources = () => {
  return new Promise((resolve) => {
    // Check if Leaflet is already loaded
    if (typeof L !== "undefined" && L) {
      resolve();
      return;
    }

    // Add Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const leafletCSS = document.createElement("link");
      leafletCSS.id = "leaflet-css";
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      leafletCSS.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      leafletCSS.crossOrigin = "";
      document.head.appendChild(leafletCSS);
    }

    // Add Leaflet JS if not already present
    if (!document.getElementById("leaflet-js")) {
      const leafletJS = document.createElement("script");
      leafletJS.id = "leaflet-js";
      leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leafletJS.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      leafletJS.crossOrigin = "";

      // Wait for script to load
      leafletJS.onload = () => {
        console.log("Leaflet loaded successfully");
        resolve();
      };

      document.head.appendChild(leafletJS);
    }
  });
};

/**
 * Creates a custom marker icon for the map
 * @returns {Object} Leaflet DivIcon instance
 */
export const createCustomMarkerIcon = () => {
  if (typeof L === "undefined" || !L) return null;

  return L.divIcon({
    html: `<i class="fas fa-map-marker-alt fa-2x" style="color: var(--error-color);"></i>`,
    className: "custom-map-marker",
    iconSize: [24, 40],
    iconAnchor: [12, 40],
  });
};

/**
 * Initialize a map on an element
 * @param {HTMLElement} element - DOM element to attach the map to
 * @param {Array} initialPosition - [lat, lng] array for initial position
 * @param {Number} zoom - Initial zoom level
 * @param {Function} onClickCallback - Callback when map is clicked
 * @returns {Object} Map and marker objects
 */
export const initializeMap = (
  element,
  initialPosition = [-6.2088, 106.8456],
  zoom = 13,
  onClickCallback = null
) => {
  if (typeof L === "undefined" || !L) {
    console.error("Leaflet is not loaded!");
    return { map: null, marker: null };
  }

  // Create map instance
  const map = L.map(element).setView(initialPosition, zoom);

  // Add tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Create marker
  const customIcon = createCustomMarkerIcon();
  const marker = L.marker(initialPosition, { icon: customIcon }).addTo(map);

  // Add click handler
  if (onClickCallback) {
    map.on("click", (e) => {
      const position = [e.latlng.lat, e.latlng.lng];
      marker.setLatLng(position);
      onClickCallback(position[0], position[1]);
    });
  }

  // Return both map and marker
  return { map, marker };
};

/**
 * Updates marker position on the map
 * @param {Object} map - Leaflet map instance
 * @param {Object} marker - Leaflet marker instance
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @param {Number} zoom - Optional zoom level
 */
export const updateMapMarker = (map, marker, lat, lng, zoom = null) => {
  if (!map || !marker) return;

  // Update marker position
  marker.setLatLng([lat, lng]);

  // Pan map to new location
  if (zoom !== null) {
    map.setView([lat, lng], zoom, { animate: true });
  } else {
    map.panTo([lat, lng], { animate: true });
  }
};
