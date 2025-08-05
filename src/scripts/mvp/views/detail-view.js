import StoryModel from "../models/story-model";

class DetailView {
  constructor() {
    this._storyContainer = null;
    this._loadingIndicator = null;
    this._mapInstance = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div id="loading" class="loading">
          <span class="spinner"></span>
          <p>Memuat detail cerita...</p>
        </div>
        
        <div id="story-detail" class="story-detail"></div>
      </section>
    `;
  }

  initElements() {
    this._storyContainer = document.getElementById("story-detail");
    this._loadingIndicator = document.getElementById("loading");
    return this;
  }

  showLoading() {
    this._loadingIndicator.classList.remove("hidden");
    this._storyContainer.classList.add("hidden");
  }

  hideLoading() {
    this._loadingIndicator.classList.add("hidden");
    this._storyContainer.classList.remove("hidden");
  }

  async displayStory(story) {
    // Clean up existing map if any
    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
    }

    // Format date
    const date = new Date(story.createdAt);
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    // Create location string if available
    let locationString = "";
    if (story.lat && story.lon) {
      locationString = `
        <div class="story-detail__location">
          <i class="fas fa-map-marker-alt"></i>
          <a href="#/maps/${story.lat}/${story.lon}" class="location-link">
            Lihat Lokasi
          </a>
        </div>
      `;
    }

    // Check if story is liked
    const storyModel = new StoryModel();
    const isLiked = await storyModel.isStoryLiked(story.id);

    this._storyContainer.innerHTML = `
      <article class="story-detail__article">
        <div class="story-detail__header">
          <h1 class="story-detail__title">${story.name}'s Story</h1>
          <div class="story-detail__meta">
            <span class="story-detail__date">
              <i class="fas fa-calendar"></i> ${formattedDate}
            </span>
            ${locationString}
          </div>
        </div>
        
        <div class="story-detail__content">
          <figure class="story-detail__figure">
            <img 
              src="${story.photoUrl}" 
              alt="Foto cerita dari ${story.name}" 
              class="story-detail__image"
              loading="lazy"
              onclick="this.classList.toggle('expanded')"
            >
          </figure>
          
          <div class="story-detail__text">
            <p class="story-detail__description">${story.description}</p>
          </div>
          
          ${
            story.lat && story.lon
              ? `
            <div class="story-detail__map">
              <h2 class="story-detail__map-title">Lokasi Cerita</h2>
              <div id="map" class="map-container"></div>
              <div class="story-detail__coordinates">
                <span><i class="fas fa-map-marker-alt"></i> Latitude: ${story.lat.toFixed(
                  6
                )}</span>
                <span><i class="fas fa-map-marker-alt"></i> Longitude: ${story.lon.toFixed(
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
          <button class="btn btn-${
            isLiked ? "danger" : "secondary"
          } favorite-btn" id="favorite-button" data-id="${story.id}">
            <i class="fas fa-${isLiked ? "heart-broken" : "heart"}"></i> ${
      isLiked ? "Hapus dari Favorit" : "Tambahkan ke Favorit"
    }
          </button>
          ${
            navigator.share
              ? `
            <button class="btn btn-secondary share-btn" id="share-button">
              <i class="fas fa-share-alt"></i> Bagikan
            </button>
          `
              : ""
          }
        </div>
      </article>
    `;

    // Initialize map if coordinates are available
    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon, story.name, story.description);
    }

    // Setup share button
    const shareButton = document.getElementById("share-button");
    if (shareButton && navigator.share) {
      shareButton.addEventListener("click", () => {
        this._shareStory(story);
      });
    }

    // Setup favorite button
    const favoriteButton = document.getElementById("favorite-button");
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => {
        if (this._favoriteCallback) {
          this._favoriteCallback(story, isLiked);
        }
      });
    }
  }

  showErrorMessage(message) {
    this._storyContainer.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p class="error-message">${message}</p>
        <a href="#/" class="btn story-detail__back-btn">
          <i class="fas fa-arrow-left"></i> Kembali ke Beranda
        </a>
      </div>
    `;
    this.hideLoading();
  }

  // Map instance reference
  _mapInstance = null;

  // Initialize map in the detail view
  _initMap(lat, lon, name, description) {
    // Import leaflet dynamically
    import("leaflet")
      .then((L) => {
        // First ensure we clean up any existing map instance
        if (this._mapInstance) {
          console.log("Cleaning up existing map instance");
          this._mapInstance.remove();
          this._mapInstance = null;
        }

        // Always recreate the map container to avoid initialization issues
        const mapParent = document.querySelector(".story-detail__map");
        if (mapParent) {
          // Remove old map element completely
          const oldMapElement = document.getElementById("map");
          if (oldMapElement) {
            oldMapElement.remove();
          }

          // Create a new map container
          const newMapElement = document.createElement("div");
          newMapElement.id = "map";
          newMapElement.className = "map-container";
          mapParent.insertBefore(
            newMapElement,
            document.querySelector(".story-detail__coordinates")
          );
        }

        // Get fresh reference to the newly created map element
        const mapElement = document.getElementById("map");
        if (!mapElement) {
          console.log("Map element not found, cannot initialize map");
          return;
        }

        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          try {
            // Initialize new map on the fresh element
            console.log("Initializing new map instance");
            this._mapInstance = L.map(mapElement, {
              // Use options that prevent conflicts
              attributionControl: false,
              zoomControl: true,
            }).setView([lat, lon], 15);

            // Add attribution separately to avoid issues
            L.control
              .attribution({
                prefix:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              })
              .addTo(this._mapInstance);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: false, // We added attribution separately
            }).addTo(this._mapInstance);

            // Add marker with popup
            L.marker([lat, lon])
              .addTo(this._mapInstance)
              .bindPopup(
                `<b>${name}</b><br>${description.substring(0, 100)}...`
              )
              .openPopup();

            // Update map size
            this._mapInstance.invalidateSize();

            console.log("Map initialized successfully");
          } catch (error) {
            console.error("Error initializing map:", error);
          }
        }, 300); // Increased delay for better stability
      })
      .catch((error) => {
        console.error("Error loading Leaflet:", error);
      });
  }

  // Share story using Web Share API if available
  async _shareStory(story) {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: `Cerita dari ${story.name}`,
        text: story.description.substring(0, 100) + "...",
        url: window.location.href,
      });
      console.log("Berhasil membagikan cerita");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  // Clean up resources when view is no longer needed
  cleanup() {
    if (this._mapInstance) {
      console.log("Cleaning up map resources");
      try {
        this._mapInstance.remove();
      } catch (error) {
        console.warn("Error while removing map:", error);
      }
      this._mapInstance = null;

      // Remove map element completely from DOM
      const mapElement = document.getElementById("map");
      if (mapElement) {
        mapElement.remove();
      }
    }

    // Remove any event listeners if needed
    const shareButton = document.getElementById("share-button");
    if (shareButton) {
      shareButton.replaceWith(shareButton.cloneNode(true));
    }

    const favoriteButton = document.getElementById("favorite-button");
    if (favoriteButton) {
      favoriteButton.replaceWith(favoriteButton.cloneNode(true));
    }
  }

  // Add handler for favorite/unfavorite button
  setFavoriteHandler(handler) {
    this._favoriteCallback = handler;
  }
}

export default DetailView;
