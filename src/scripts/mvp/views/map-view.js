class MapView {
  constructor() {
    this._mapContainer = null;
    this._loadingIndicator = null;
    this._map = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="map-page">
          <h1 class="page-title">Peta Lokasi Cerita</h1>
          
          <div id="loading" class="loading">
            <span class="spinner"></span>
            <p>Memuat peta...</p>
          </div>
          
          <div id="map-container" class="map-container hidden"></div>
          
          <div class="map-actions">
            <a href="#/" class="btn btn-back">
              <i class="fas fa-arrow-left"></i> Kembali ke Beranda
            </a>
          </div>
        </div>
      </section>
    `;
  }

  initElements() {
    this._mapContainer = document.getElementById("map-container");
    this._loadingIndicator = document.getElementById("loading");
    return this;
  }

  showLoading() {
    this._loadingIndicator.classList.remove("hidden");
    this._mapContainer.classList.add("hidden");
  }

  hideLoading() {
    this._loadingIndicator.classList.add("hidden");
    this._mapContainer.classList.remove("hidden");
  }

  initMap(latitude, longitude, stories) {
    this.showLoading();

    console.log("Initializing map with:", { latitude, longitude });

    try {
      // Make sure Leaflet is loaded
      if (typeof L === "undefined" || !L) {
        console.error("Leaflet library is not loaded!");
        this.showErrorMessage(
          "Leaflet library tidak ditemukan. Harap muat ulang halaman."
        );

        // Muat ulang script Leaflet dan tunggu dimuat
        const loadLeaflet = () => {
          return new Promise((resolve) => {
            if (!document.querySelector('script[src*="leaflet"]')) {
              const leafletScript = document.createElement("script");
              leafletScript.src =
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
              leafletScript.onload = resolve;
              document.head.appendChild(leafletScript);
            } else {
              resolve();
            }
          });
        };

        loadLeaflet().then(() => {
          console.log("Leaflet dynamically loaded");
          setTimeout(() => this.initMap(latitude, longitude, stories), 500);
        });
        return;
      }
    } catch (e) {
      console.error("Error checking Leaflet:", e);
      this.showErrorMessage("Error loading map library: " + e.message);
      return;
    }

    try {
      // Ensure container is visible and has a proper size
      this._mapContainer.classList.remove("hidden");
      this._mapContainer.style.height = "400px"; // Set explicit height
      this._mapContainer.style.width = "100%";

      console.log("Map container:", this._mapContainer);

      // Initialize map with proper lat/lng objects
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates: " + latitude + ", " + longitude);
      }

      console.log("Creating map with coords:", lat, lng);

      // Destroy existing map instance if it exists
      if (this._map) {
        this._map.remove();
        this._map = null;
      }

      // Initialize map
      this._map = L.map(this._mapContainer).setView([lat, lng], 13);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);
    } catch (e) {
      console.error("Error initializing map:", e);
      this.showErrorMessage("Error initializing map: " + e.message);
      return;
    }

    // Add marker for the current location
    L.marker([latitude, longitude])
      .addTo(this._map)
      .bindPopup("Lokasi ini")
      .openPopup();

    // Add markers for stories with location
    if (stories && stories.length > 0) {
      stories.forEach((story) => {
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon]).addTo(this._map).bindPopup(`
              <div class="map-popup">
                <h3>${story.name}</h3>
                <p>${story.description.substring(0, 50)}${
            story.description.length > 50 ? "..." : ""
          }</p>
                <a href="#/detail/${
                  story.id
                }" class="popup-link">Lihat detail</a>
              </div>
            `);
        }
      });
    }

    this.hideLoading();
  }

  showErrorMessage(message) {
    // Pastikan mapContainer tidak null
    if (this._mapContainer) {
      this._mapContainer.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <p class="error-message">${message}</p>
        </div>
      `;
      this.hideLoading();
    } else {
      // Jika belum diinisialisasi, coba inisialisasi ulang elemen
      this.initElements();

      if (this._loadingIndicator) {
        this._loadingIndicator.innerHTML = `
          <div class="error-container">
            <i class="fas fa-exclamation-circle error-icon"></i>
            <p class="error-message">${message}</p>
          </div>
        `;
      }
    }
  }
}

export default MapView;
