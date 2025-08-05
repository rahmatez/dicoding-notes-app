import { getAllStories } from "../../data/api";

class MapPage {
  constructor() {
    this._mapElement = null;
    this._map = null;
    this._stories = [];
    this._markers = [];
    this._layers = {};
  }

  async render() {
    return `
      <section class="container">
        <div class="map-page">
          <h1>Peta Cerita</h1>
          <p>Jelajahi cerita berdasarkan lokasi</p>

          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Memuat peta dan cerita...</p>
          </div>

          <div id="error-container" class="alert alert-error hidden">
            <i class="fas fa-exclamation-circle"></i>
            <span id="error-message"></span>
            <div class="error-actions">
              <a href="#/login" class="btn btn-sm">Login</a>
              <a href="#/register" class="btn btn-sm btn-secondary">Daftar</a>
            </div>
          </div>

          <div id="map-container">
            <div id="map-full" class="map-container" style="height: 600px;"></div>
            <div id="layer-control" class="layer-control"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._loadingElement = document.getElementById("loading");
    this._errorContainer = document.getElementById("error-container");
    this._mapElement = document.getElementById("map-full");
    this._layerControlElement = document.getElementById("layer-control");

    await this._initMap();
    await this._fetchStories();
  }

  async _initMap() {
    try {
      // Import Leaflet secara dinamis
      const L = await import("leaflet");

      // Jika map sudah ada sebelumnya, hapus untuk mencegah error "already initialized"
      if (this._map) {
        this._map.remove();
        this._map = null;
        this._markers = [];
      }

      // Inisialisasi peta dengan lokasi default (Indonesia)
      this._map = L.map(this._mapElement).setView([-2.548926, 118.0148634], 5);

      // Menambahkan beberapa layer peta (kriteria opsional 4)
      this._layers = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ),
        "Stamen Watercolor": L.tileLayer(
          "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
          {
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ),
        "Stamen Terrain": L.tileLayer(
          "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
          {
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ),
        "CartoDB Dark Matter": L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }
        ),
      };

      // Menambahkan layer default ke peta
      this._layers["OpenStreetMap"].addTo(this._map);

      // Menambahkan layer control (kriteria opsional 4)
      L.control.layers(this._layers).addTo(this._map);
    } catch (error) {
      this._showError("Gagal memuat peta. Silakan coba lagi nanti.");
      console.error(error);
    }
  }

  async _fetchStories() {
    try {
      const data = await getAllStories({ location: 1 });
      this._stories = data.listStory.filter((story) => story.lat && story.lon);

      if (this._stories.length > 0) {
        this._renderMarkers();
      } else {
        this._showError("Tidak ada cerita dengan lokasi yang tersedia.");
      }
    } catch (error) {
      this._showError(error.message || "Gagal memuat cerita");
    } finally {
      this._hideLoading();
    }
  }

  _renderMarkers() {
    // Pastikan leaflet dan map sudah dimuat
    import("leaflet").then((L) => {
      if (!this._map) return;

      // Hapus marker yang sudah ada sebelumnya
      this._markers.forEach((marker) => marker.remove());
      this._markers = [];

      // Buat marker cluster untuk grup marker (opsional)
      const markerCluster = L.markerClusterGroup
        ? L.markerClusterGroup()
        : null;

      // Buat marker untuk setiap cerita
      this._stories.forEach((story) => {
        const marker = L.marker([story.lat, story.lon]).bindPopup(`
            <div class="map-popup">
              <img src="${story.photoUrl}" alt="Foto cerita dari ${
          story.name
        }" style="width:100%; max-height:150px; object-fit:cover;">
              <h3>${story.name}</h3>
              <p>${story.description.substring(0, 100)}...</p>
              <a href="#/detail/${
                story.id
              }" class="map-popup__link">Lihat Detail</a>
            </div>
          `);

        if (markerCluster) {
          markerCluster.addLayer(marker);
        } else {
          marker.addTo(this._map);
        }

        this._markers.push(marker);
      });

      // Tambahkan marker cluster ke peta jika tersedia
      if (markerCluster) {
        this._map.addLayer(markerCluster);
      }

      // Fit bounds untuk melihat semua marker
      if (this._markers.length > 0) {
        const group = L.featureGroup(this._markers);
        this._map.fitBounds(group.getBounds().pad(0.1));
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
    // Jika error berkaitan dengan authentication, tampilkan pesan yang lebih ramah
    if (
      message.includes("authentication") ||
      message.includes("Missing authentication")
    ) {
      message = "Anda harus login terlebih dahulu untuk melihat peta cerita";
    }

    this._errorContainer.textContent = message;
    this._errorContainer.classList.remove("hidden");
  }
}

export default MapPage;
