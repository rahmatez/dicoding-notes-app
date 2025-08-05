import StoryModel from "../models/story-model";
import { checkAuth, loadLeafletResources, updateMapMarker } from "../../utils";

class CreateStoryPresenter {
  constructor({ model, view }) {
    this._model = model || new StoryModel();
    this._view = view;
  }

  async init() {
    // Check if user is logged in
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      window.location.hash = "#/login";
      return;
    }

    this._view.initElements();
    this._view.initEvents();

    // Preload Leaflet for better user experience
    try {
      await loadLeafletResources();
    } catch (error) {
      console.warn("Could not preload Leaflet:", error);
    }

    this._view.initMapEvents(); // Initialize map events
    this._view.bindFormSubmit(this._handleStorySubmit.bind(this));
    this._view.bindGetLocation(this._handleGetLocation.bind(this));
  }

  async _handleStorySubmit(description, photo, latitude, longitude) {
    try {
      this._view.showNotification("Mengunggah cerita...", "loading");

      // Buat FormData untuk mengirim data gambar
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);

      // Tambahkan lokasi jika ada
      if (latitude && longitude) {
        formData.append("lat", latitude);
        formData.append("lon", longitude);
      }

      const response = await this._model.addStory(formData);

      if (response.error) {
        this._view.showNotification(
          response.message || "Gagal mengunggah cerita",
          "error"
        );
        return;
      }

      // Reset state in StoryModel to force new fetch in home page
      this._model.resetState();

      // Set a flag to force refresh home page after creating a story
      sessionStorage.setItem("forceHomeRefresh", "true");

      // Success notification
      this._view.showNotification("Cerita berhasil diunggah!", "success");
      this._view.resetForm();

      // Pre-fetch stories before redirecting
      try {
        await this._model.getStories(1, 10, true);
      } catch (error) {
        console.error("Failed to prefetch stories:", error);
      }

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.hash = "#/";
      }, 1500);
    } catch (error) {
      console.error("Error creating story:", error);
      this._view.showNotification(
        "Terjadi kesalahan saat mengunggah cerita",
        "error"
      );
    }
  }

  _handleGetLocation() {
    if (!navigator.geolocation) {
      this._view.showLocationError(
        "Geolocation tidak didukung oleh browser Anda"
      );
      return;
    }

    this._view.showNotification("Mendapatkan lokasi...", "loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this._view.setLocation(latitude, longitude);
        this._view.showNotification("Lokasi berhasil didapatkan!", "success");

        // Always show map with the current location
        this._view._mapContainer.classList.remove("hidden");

        // Make sure map is visible before updating marker
        setTimeout(() => {
          // Simple approach: Just call updateMapMarker directly on view
          this._view.updateMapMarker(latitude, longitude, 15);

          // Alternative approach: Make sure map is fully initialized
          if (!this._view._map) {
            this._initMap().then(() => {
              this._view.updateMapMarker(latitude, longitude, 15);
            });
          }
        }, 300);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Gagal mendapatkan lokasi";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Izin akses lokasi ditolak";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informasi lokasi tidak tersedia";
            break;
          case error.TIMEOUT:
            errorMessage = "Permintaan lokasi habis waktu";
            break;
        }

        this._view.showLocationError(errorMessage);
        this._view.showNotification(errorMessage, "error");
      },
      { timeout: 10000 }
    );
  }

  async _initMap() {
    // Make sure Leaflet is loaded
    await loadLeafletResources();

    // Make sure map container is visible
    if (this._view._mapContainer.classList.contains("hidden")) {
      this._view._mapContainer.classList.remove("hidden");
    }

    // Initialize map if needed
    if (!this._view._map && this._view._locationMap) {
      return new Promise((resolve) => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          try {
            this._updateMapMarker(0, 0);
            resolve();
          } catch (error) {
            console.error("Error initializing map:", error);
            resolve(); // Resolve anyway to prevent hanging
          }
        }, 300);
      });
    }

    return Promise.resolve();
  }

  async _updateMapMarker(latitude, longitude) {
    // Make sure Leaflet is loaded
    await loadLeafletResources();

    // If map isn't visible, show it
    if (this._view._mapContainer.classList.contains("hidden")) {
      this._view._mapContainer.classList.remove("hidden");
    }

    // If map isn't initialized yet, initialize it
    if (!this._view._map && this._view._locationMap) {
      // Initialize map centered on the provided coordinates
      this._view._map = L.map(this._view._locationMap).setView(
        [latitude, longitude],
        15
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._view._map);

      // Add click handler to map
      this._view._map.on("click", (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Update form fields
        this._view.setLocation(lat, lng);

        // Update marker
        this._view.updateMapMarker(lat, lng);

        // Update status text
        this._view._locationStatus.textContent = `Lokasi dipilih: ${lat.toFixed(
          6
        )}, ${lng.toFixed(6)}`;
        this._view._locationStatus.className = "location-status success";
      });

      // Update map size
      setTimeout(() => this._view._map.invalidateSize(), 100);
    }

    // Update marker on the map
    this._view.updateMapMarker(latitude, longitude, 15);
  }
}

export default CreateStoryPresenter;
