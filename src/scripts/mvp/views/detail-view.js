import { RouterHelper } from "../../utils";

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

    // Use isLiked status passed from presenter
    const isLiked = story.isLiked;

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
        console.log("Leaflet loaded successfully for detail view");

        // Clean up any existing map instance COMPLETELY
        this._cleanupMap();

        // Give the DOM a moment to update after cleanup
        setTimeout(() => {
          try {
            // Get the map container
            const mapParent = document.querySelector(".story-detail__map");
            if (!mapParent) {
              console.error("Map parent container not found");
              return;
            }

            console.log("Creating new map container");

            // Create a fresh map container with unique ID to avoid conflicts
            const mapId = "map-" + Date.now();
            const mapElement = document.createElement("div");
            mapElement.id = mapId;
            mapElement.className = "map-container";
            mapElement.style.height = "300px"; // Explicit height helps with rendering
            mapElement.style.width = "100%";

            // Pastikan parent kosong sebelum menambahkan elemen baru
            mapParent.innerHTML = "";
            mapParent.appendChild(mapElement);

            console.log("Map container created with ID:", mapId);

            // Create the map instance
            this._mapInstance = L.map(mapId, {
              center: [lat, lon],
              zoom: 15,
              zoomControl: true,
            });

            // Add the tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(this._mapInstance);

            // Create simple marker with clear styling directly
            const markerHtml = `
              <div style="
                background-color: #e74c3c; 
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
              "></div>
            `;

            // Create a custom icon without using the helper
            const simpleIcon = L.divIcon({
              html: markerHtml,
              className: "custom-map-marker",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            // Add marker with the custom icon
            console.log("Adding marker at:", lat, lon);

            // Create marker and add to map
            const marker = L.marker([lat, lon], {
              icon: simpleIcon,
              alt: "Story location marker",
            }).addTo(this._mapInstance);

            // Add popup to marker
            marker
              .bindPopup(
                `<b>${name}</b><br>${description.substring(0, 100)}...`
              )
              .openPopup();

            console.log("Map marker created successfully");

            // Force a resize/redraw
            this._mapInstance.invalidateSize(true);

            console.log(
              "Map initialized successfully with marker at:",
              lat,
              lon
            );
          } catch (error) {
            console.error("Error during map initialization:", error);
          }
        }, 500);
      })
      .catch((error) => {
        console.error("Error loading Leaflet library:", error);
      });
  }

  // Helper method to properly clean up the map
  _cleanupMap() {
    console.log("Cleaning up map resources completely");

    try {
      // Remove existing map instance if it exists
      if (this._mapInstance) {
        console.log("Removing existing map instance");
        // Remove all layers from the map
        this._mapInstance.eachLayer((layer) => {
          this._mapInstance.removeLayer(layer);
        });
        // Disable all event handlers
        this._mapInstance.off();
        // Stop any animations/handlers
        this._mapInstance.stopLocate();
        // Remove the map completely
        this._mapInstance.remove();
        // Clear reference
        this._mapInstance = null;
      }
    } catch (error) {
      console.warn("Error cleaning up map instance:", error);
    }

    try {
      // Clean up DOM elements
      // 1. Find all map containers (using both id and class selectors)
      const mapContainers = document.querySelectorAll(
        '#map, .map-container, div[id^="map-"]'
      );
      mapContainers.forEach((container) => {
        if (container && container.parentNode) {
          console.log("Removing map container:", container.id);
          // Clear any Leaflet-specific attributes
          if (container._leaflet_id) {
            delete container._leaflet_id;
          }
          container.remove();
        }
      });

      // 2. Remove any orphaned Leaflet elements
      document
        .querySelectorAll(".leaflet-container, .leaflet-control, .leaflet-pane")
        .forEach((el) => {
          console.log("Removing orphaned Leaflet element:", el.className);
          el.remove();
        });

      // 3. Clean up the map parent container for fresh start
      const mapParent = document.querySelector(".story-detail__map");
      if (mapParent) {
        // Keep the title but remove all map-related content
        const mapTitle = mapParent.querySelector(".story-detail__map-title");
        const coordinates = mapParent.querySelector(
          ".story-detail__coordinates"
        );

        // Clear the parent while preserving the title and coordinates
        mapParent.innerHTML = "";
        if (mapTitle) mapParent.appendChild(mapTitle);
        if (coordinates) mapParent.appendChild(coordinates);
      }
    } catch (error) {
      console.warn("Error cleaning up map DOM elements:", error);
    }
  }

  // Share story using Web Share API if available
  async _shareStory(story) {
    if (!navigator.share) return;

    try {
      // Get current URL without accessing document directly
      const currentUrl = RouterHelper.getCurrentUrl();

      await navigator.share({
        title: `Cerita dari ${story.name}`,
        text: story.description.substring(0, 100) + "...",
        url: currentUrl,
      });
      console.log("Berhasil membagikan cerita");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  // Clean up resources when view is no longer needed
  cleanup() {
    // Clean up map resources
    this._cleanupMap();

    // Remove all event listeners
    this.removeEventListeners();

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

  // Add handlers for navigation events
  setBeforeUnloadHandler(handler) {
    this._beforeUnloadHandler = handler;
    RouterHelper.addEventListener("beforeunload", this._beforeUnloadHandler);
  }

  setHashChangeHandler(handler) {
    this._hashChangeHandler = handler;
    RouterHelper.addEventListener("hashchange", this._hashChangeHandler);
  }

  // Remove event listeners
  removeEventListeners() {
    if (this._beforeUnloadHandler) {
      RouterHelper.removeEventListener(
        "beforeunload",
        this._beforeUnloadHandler
      );
    }

    if (this._hashChangeHandler) {
      RouterHelper.removeEventListener("hashchange", this._hashChangeHandler);
    }
  }
}

export default DetailView;
