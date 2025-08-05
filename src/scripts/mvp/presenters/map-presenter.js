import StoryModel from "../models/story-model";
import { checkAuth } from "../../utils";

class MapPresenter {
  constructor({ model, view }) {
    this._model = model || new StoryModel();
    this._view = view;
    this._latitude = null;
    this._longitude = null;
  }

  async init(latitude = null, longitude = null) {
    this._latitude = latitude;
    this._longitude = longitude;

    // Inisialisasi elemen terlebih dahulu agar tidak null
    this._view.initElements();

    // Check if user is logged in
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      this._view.showErrorMessage("Anda perlu login untuk melihat peta");
      return;
    }

    // If no specific coordinates are provided, use default or geolocation
    if (!this._latitude || !this._longitude) {
      await this._useCurrentLocation();
    } else {
      await this._fetchStories();
    }
  }

  async _useCurrentLocation() {
    try {
      // Tambahkan konsol log untuk debug
      console.log("Trying to get geolocation...");

      if (!navigator.geolocation) {
        console.log("Geolocation not supported, using default coordinates");
        this._latitude = -6.2088; // Default to Jakarta
        this._longitude = 106.8456;
        await this._fetchStories();
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 0,
          enableHighAccuracy: true,
        });
      });

      console.log("Geolocation received:", position.coords);
      this._latitude = position.coords.latitude;
      this._longitude = position.coords.longitude;
      await this._fetchStories();
    } catch (error) {
      console.error("Geolocation error:", error);
      // Fallback ke koordinat default
      this._latitude = -6.2088; // Default to Jakarta
      this._longitude = 106.8456;
      await this._fetchStories();
    }
  }

  async _fetchStories() {
    this._view.showLoading();

    try {
      // Get stories with location
      const listStory = await this._model.getStories(1, 50, true);

      // Initialize map with fetched stories
      this._view.initMap(
        parseFloat(this._latitude),
        parseFloat(this._longitude),
        listStory
      );
    } catch (error) {
      console.error("Error fetching stories for map:", error);
      this._view.showErrorMessage("Terjadi kesalahan saat memuat peta");
    }
  }
}

export default MapPresenter;
