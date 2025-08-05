import { parseActivePathname } from "../../routes/url-parser";
import { showFormattedDateTime } from "../../utils";
import StoryIdb from "../../data/story-idb";

class DetailPage {
  constructor() {
    this._story = null;
    this._mapElement = null;
    this._map = null;
    this._isLiked = false;
    this._favoriteHandler = null;
  }

  async render() {
    return `
      <section class="container">
        <div id="story-container">
          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Memuat cerita...</p>
          </div>

          <div id="error-container" class="alert alert-error hidden"></div>

          <div id="story-detail" class="story-detail hidden">
            <!-- Konten cerita akan ditampilkan di sini -->
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._loadingElement = document.getElementById("loading");
    this._errorContainer = document.getElementById("error-container");
    this._storyDetailElement = document.getElementById("story-detail");

    const { id } = parseActivePathname();
    if (!id) {
      this._showError("ID cerita tidak ditemukan");
      return;
    }
  }

  // Set handler for favorite button
  setFavoriteHandler(handler) {
    this._favoriteHandler = handler;
  }

  // Initialize elements for the view
  initElements() {
    this._loadingElement = document.getElementById("loading");
    this._errorContainer = document.getElementById("error-container");
    this._storyDetailElement = document.getElementById("story-detail");
  }

  // Show loading indicator
  showLoading() {
    this._loadingElement.classList.remove("hidden");
  }

  // Hide loading indicator
  hideLoading() {
    this._loadingElement.classList.add("hidden");
  }

  // Show error message
  showErrorMessage(message) {
    this._errorContainer.textContent = message;
    this._errorContainer.classList.remove("hidden");
    this._hideLoading();
  }

  // Display story details
  async displayStory(story) {
    this._story = story;

    // Check if this story is in favorites
    try {
      this._isLiked = await StoryIdb.isStoryLiked(story.id);
    } catch (error) {
      console.error("Error checking if story is liked:", error);
      this._isLiked = false;
    }

    this._renderStoryDetail();
  }

  // Clean up resources
  cleanup() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  _renderStoryDetail() {
    if (!this._story) return;

    this._storyDetailElement.innerHTML = `
      <article class="story-detail__article">
        <div class="story-detail__header">
          <h1 class="story-detail__title">${this._story.name}</h1>
          <div class="story-detail__meta">
            <span class="story-detail__date">
              <i class="fas fa-calendar"></i> ${showFormattedDateTime(
                this._story.createdAt
              )}
            </span>
          </div>
        </div>

        <div class="story-detail__content">
          <figure class="story-detail__figure">
            <img 
              src="${this._story.photoUrl}" 
              alt="Foto cerita dari ${this._story.name}"
              class="story-detail__image"
              loading="lazy"
              onclick="this.classList.toggle('expanded')"
            >
          </figure>
          
          <div class="story-detail__text">
            <p class="story-detail__description">${this._story.description}</p>
          </div>
          
          ${
            this._story.lat && this._story.lon
              ? `
            <div class="story-detail__map">
              <h2 class="story-detail__map-title">Lokasi Cerita</h2>
              <div id="map" class="map-container"></div>
              <div class="story-detail__coordinates">
                <span><i class="fas fa-map-marker-alt"></i> Latitude: ${this._story.lat.toFixed(
                  6
                )}</span>
                <span><i class="fas fa-map-marker-alt"></i> Longitude: ${this._story.lon.toFixed(
                  6
                )}</span>
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div class="story-detail__actions">
          <a href="#/" class="btn story-detail__back-btn">
            <i class="fas fa-arrow-left"></i> Kembali ke Beranda
          </a>
          <button class="btn btn-secondary share-btn" id="share-button">
            <i class="fas fa-share-alt"></i> Bagikan
          </button>
          <button class="btn ${
            this._isLiked ? "btn-danger" : "btn-primary"
          } favorite-btn" id="favorite-button">
            <i class="fas ${this._isLiked ? "fa-heart" : "fa-heart-o"}"></i> 
            ${this._isLiked ? "Hapus dari Favorit" : "Tambah ke Favorit"}
          </button>
        </div>
      </article>
    `;

    this._storyDetailElement.classList.remove("hidden");

    // Inisialisasi peta jika koordinat tersedia
    if (this._story.lat && this._story.lon) {
      this._initMap();
    }

    // Setup share button
    const shareButton = document.getElementById("share-button");
    if (shareButton && navigator.share) {
      shareButton.addEventListener("click", () => {
        this._shareStory();
      });
    } else if (shareButton) {
      // Hide share button if Web Share API not supported
      shareButton.classList.add("hidden");
    }

    // Setup favorite button
    const favoriteButton = document.getElementById("favorite-button");
    if (favoriteButton && this._favoriteHandler) {
      // Remove existing event listeners to prevent duplicates
      const newFavoriteButton = favoriteButton.cloneNode(true);
      favoriteButton.parentNode.replaceChild(newFavoriteButton, favoriteButton);

      // Add new event listener
      newFavoriteButton.addEventListener("click", () => {
        this._handleFavoriteClick();
      });
    }
  }

  _initMap() {
    // Import leaflet secara dinamis untuk menghemat bandwidth jika tidak digunakan
    import("leaflet").then((L) => {
      this._mapElement = document.getElementById("map");

      if (!this._mapElement) return;

      // Pastikan map sudah dibersihkan sebelum inisialisasi baru
      if (this._map) {
        this._map.remove();
        this._map = null;
      }

      try {
        this._map = L.map(this._mapElement).setView(
          [this._story.lat, this._story.lon],
          15
        );

        // Tambahkan tile layer (peta dasar)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this._map);

        // Tambahkan marker dengan popup
        L.marker([this._story.lat, this._story.lon])
          .addTo(this._map)
          .bindPopup(
            `<b>${this._story.name}</b><br>${this._story.description.substring(
              0,
              100
            )}...`
          )
          .openPopup();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    });
  }

  _showLoading() {
    this._loadingElement.classList.remove("hidden");
  }

  _hideLoading() {
    this._loadingElement.classList.add("hidden");
  }

  _showError(message) {
    this._errorContainer.textContent = message;
    this._errorContainer.classList.remove("hidden");
  }

  async _shareStory() {
    if (!this._story || !navigator.share) return;

    try {
      await navigator.share({
        title: `Cerita dari ${this._story.name}`,
        text: this._story.description.substring(0, 100) + "...",
        url: window.location.href,
      });
      console.log("Berhasil membagikan cerita");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  async _handleFavoriteClick() {
    if (!this._story || !this._favoriteHandler) return;

    try {
      // Call the handler from presenter
      await this._favoriteHandler(this._story, this._isLiked);

      // Toggle the liked state (the actual state will be updated when displayStory is called again)
      this._isLiked = !this._isLiked;

      // Update UI immediately for better UX
      const favoriteButton = document.getElementById("favorite-button");
      if (favoriteButton) {
        if (this._isLiked) {
          favoriteButton.classList.replace("btn-primary", "btn-danger");
          favoriteButton.innerHTML =
            '<i class="fas fa-heart"></i> Hapus dari Favorit';
        } else {
          favoriteButton.classList.replace("btn-danger", "btn-primary");
          favoriteButton.innerHTML =
            '<i class="fas fa-heart-o"></i> Tambah ke Favorit';
        }
      }
    } catch (error) {
      console.error("Error handling favorite toggle:", error);
    }
  }
}

export default DetailPage;
