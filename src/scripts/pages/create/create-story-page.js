import { addStory } from "../../data/api";
import { checkAuth } from "../../utils";

class CreateStoryPage {
  constructor() {
    this._imageFile = null;
    this._camera = null;
    this._mediaStream = null;
    this._previewElement = null;
    this._captureButton = null;
    this._videoElement = null;
    this._isCameraMode = false;
    this._mapElement = null;
    this._map = null;
    this._marker = null;
    this._coordinates = null;
    this._formElement = null;

    // Bind the cleanup method to use on page navigation
    this._cleanup = this._cleanup.bind(this);
  }

  async render() {
    // Redirect ke login jika belum login
    if (!checkAuth()) {
      window.location.hash = "#/login";
      return "";
    }

    return `
      <section class="container">
        <div class="create-story">
          <h1 class="create-story__title">Tambah Cerita Baru</h1>

          <div id="notification" class="alert hidden"></div>

          <form id="create-story-form" class="create-story__form">
            <div class="form-group">
              <label for="description" class="form-label">Deskripsi Cerita</label>
              <textarea 
                id="description" 
                name="description" 
                class="form-control" 
                rows="4" 
                required
                placeholder="Ceritakan pengalamanmu..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Foto</label>
              <div class="photo-capture">
                <div id="preview-container" class="preview-container">
                  <video id="camera-preview" class="camera-preview hidden" autoplay></video>
                  <img id="photo-preview" class="photo-preview hidden" alt="Pratinjau foto">
                  <div id="placeholder" class="placeholder">
                    <i class="fas fa-image"></i>
                    <p>Belum ada foto yang dipilih</p>
                  </div>
                </div>

                <div class="photo-actions">
                  <button type="button" id="toggle-camera" class="btn">
                    <i class="fas fa-camera"></i> Gunakan Kamera
                  </button>
                  <div class="file-input-container">
                    <label for="photo-file" class="btn">
                      <i class="fas fa-upload"></i> Unggah Foto
                    </label>
                    <input 
                      type="file" 
                      id="photo-file" 
                      name="photo" 
                      accept="image/*" 
                      class="hidden"
                    />
                  </div>
                  <button type="button" id="capture-photo" class="btn hidden">
                    <i class="fas fa-camera"></i> Ambil Foto
                  </button>
                  <button type="button" id="retry-photo" class="btn hidden">
                    <i class="fas fa-redo"></i> Coba Lagi
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Lokasi</label>
              <div id="map" class="map-container"></div>
              <p class="map-helper">Klik pada peta untuk menandai lokasi cerita</p>
              <div id="coordinates" class="coordinates hidden">
                <span>Latitude: <strong id="lat-value">0</strong></span>
                <span>Longitude: <strong id="lon-value">0</strong></span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" id="submit-btn" class="btn">
                <i class="fas fa-paper-plane"></i> Kirim Cerita
              </button>
              <a href="#/" class="btn btn-secondary">
                <i class="fas fa-times"></i> Batal
              </a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Redirect ke login jika belum login
    if (!checkAuth()) return;

    this._initElements();
    this._initEventListeners();
    this._initMap();

    // Add event listener for page navigation to clean up resources
    window.addEventListener("hashchange", this._cleanup);
  }

  _cleanup() {
    // Stop camera if active
    if (this._isCameraMode) {
      this._stopCamera();
    }

    // Clear any image files and references
    this._imageFile = null;
    if (this._previewElement) {
      this._previewElement.src = "";
    }

    // Remove the event listener
    window.removeEventListener("hashchange", this._cleanup);
  }

  _initElements() {
    this._formElement = document.getElementById("create-story-form");
    this._videoElement = document.getElementById("camera-preview");
    this._previewElement = document.getElementById("photo-preview");
    this._placeholderElement = document.getElementById("placeholder");
    this._fileInputElement = document.getElementById("photo-file");
    this._toggleCameraButton = document.getElementById("toggle-camera");
    this._captureButton = document.getElementById("capture-photo");
    this._retryButton = document.getElementById("retry-photo");
    this._coordinatesElement = document.getElementById("coordinates");
    this._latElement = document.getElementById("lat-value");
    this._lonElement = document.getElementById("lon-value");
    this._notificationElement = document.getElementById("notification");
  }

  _initEventListeners() {
    this._toggleCameraButton.addEventListener("click", () =>
      this._toggleCamera()
    );
    this._captureButton.addEventListener("click", () => this._capturePhoto());
    this._retryButton.addEventListener("click", () => this._resetCamera());
    this._fileInputElement.addEventListener("change", (event) =>
      this._handleFileInput(event)
    );
    this._formElement.addEventListener("submit", (event) =>
      this._handleSubmit(event)
    );
  }

  async _toggleCamera() {
    if (this._isCameraMode) {
      this._stopCamera();
    } else {
      await this._startCamera();
    }
  }

  async _startCamera() {
    try {
      this._mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      this._videoElement.srcObject = this._mediaStream;
      this._videoElement.classList.remove("hidden");
      this._previewElement.classList.add("hidden");
      this._placeholderElement.classList.add("hidden");
      this._captureButton.classList.remove("hidden");
      this._toggleCameraButton.innerHTML =
        '<i class="fas fa-times"></i> Tutup Kamera';
      this._isCameraMode = true;
    } catch (error) {
      this._showNotification(
        "Gagal mengakses kamera. Pastikan kamera berfungsi dan izin diberikan.",
        "error"
      );
    }
  }

  _stopCamera() {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
    }

    this._videoElement.classList.add("hidden");
    this._toggleCameraButton.innerHTML =
      '<i class="fas fa-camera"></i> Gunakan Kamera';
    this._captureButton.classList.add("hidden");

    if (this._imageFile) {
      this._previewElement.classList.remove("hidden");
    } else {
      this._placeholderElement.classList.remove("hidden");
    }

    this._isCameraMode = false;
  }

  _capturePhoto() {
    const canvas = document.createElement("canvas");
    const videoWidth = this._videoElement.videoWidth;
    const videoHeight = this._videoElement.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(this._videoElement, 0, 0, videoWidth, videoHeight);

    const dataUrl = canvas.toDataURL("image/jpeg");
    this._previewElement.src = dataUrl;
    this._previewElement.classList.remove("hidden");
    this._videoElement.classList.add("hidden");
    this._captureButton.classList.add("hidden");
    this._retryButton.classList.remove("hidden");

    // Convert dataUrl to File object and make sure it's properly created
    canvas.toBlob((blob) => {
      if (blob) {
        this._imageFile = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }, "image/jpeg");
  }

  _resetCamera() {
    this._retryButton.classList.add("hidden");
    this._videoElement.classList.remove("hidden");
    this._previewElement.classList.add("hidden");
    this._captureButton.classList.remove("hidden");
    this._imageFile = null;
  }

  _handleFileInput(event) {
    const file = event.target.files[0];

    if (file) {
      this._imageFile = file;
      const objectUrl = URL.createObjectURL(file);
      this._previewElement.src = objectUrl;
      this._previewElement.classList.remove("hidden");
      this._placeholderElement.classList.add("hidden");

      // Stop camera if active
      if (this._isCameraMode) {
        this._stopCamera();
      }

      // Validate that it's actually an image
      const img = new Image();
      img.onload = () => {
        // Valid image
        URL.revokeObjectURL(img.src); // Clean up
      };
      img.onerror = () => {
        // Invalid image
        this._showNotification(
          "File yang dipilih bukan gambar yang valid",
          "error"
        );
        this._imageFile = null;
        this._previewElement.classList.add("hidden");
        this._placeholderElement.classList.remove("hidden");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    }
  }

  _initMap() {
    console.log("Initializing map in create-story-page.js");

    // Import both leaflet and our custom helper
    Promise.all([import("leaflet"), import("../../utils/map-helper")]).then(
      ([L, MapHelper]) => {
        console.log("Leaflet and MapHelper loaded successfully");
        this._mapElement = document.getElementById("map");

        // Pastikan map sudah dibersihkan sebelum inisialisasi baru
        if (this._map) {
          this._map.remove();
          this._map = null;
          this._marker = null;
        }

        try {
          // Inisialisasi peta dengan lokasi default (Indonesia)
          this._map = L.map(this._mapElement).setView(
            [-2.548926, 118.0148634],
            5
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(this._map);

          // Tambahkan event listener untuk klik pada peta
          this._map.on("click", (event) => {
            const { lat, lng } = event.latlng;
            console.log("Map clicked at:", lat, lng);

            try {
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

              // Create a custom icon
              const simpleIcon = L.divIcon({
                html: markerHtml,
                className: "custom-map-marker",
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              });

              // Update marker jika sudah ada
              if (this._marker) {
                this._marker.setLatLng([lat, lng]);
                console.log("Updated existing marker position");
              } else {
                // Buat marker baru dengan ikon yang jelas
                this._marker = L.marker([lat, lng], {
                  icon: simpleIcon,
                  alt: "Location marker",
                }).addTo(this._map);
                console.log("Created new marker at position:", lat, lng);
              }
            } catch (err) {
              console.error("Error creating marker:", err);
              // Fallback ke marker default jika ada error
              this._marker = L.marker([lat, lng]).addTo(this._map);
            }

            // Simpan koordinat
            this._coordinates = { lat, lon: lng };
            this._latElement.textContent = lat.toFixed(6);
            this._lonElement.textContent = lng.toFixed(6);
            this._coordinatesElement.classList.remove("hidden");
          });
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    );
  }

  async _handleSubmit(event) {
    event.preventDefault();

    // Prevent default browser validation
    event.stopPropagation();

    const descriptionValue = document.getElementById("description").value;

    if (!descriptionValue.trim()) {
      this._showNotification("Mohon isi deskripsi cerita", "error");
      return;
    }

    if (!this._imageFile) {
      this._showNotification(
        "Mohon pilih atau ambil foto untuk cerita",
        "error"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("description", descriptionValue);

      // Make sure the image file is valid before appending
      if (this._imageFile && this._imageFile instanceof File) {
        formData.append("photo", this._imageFile);
      } else {
        this._showNotification("Format foto tidak valid", "error");
        return;
      }

      // Tambahkan koordinat jika ada
      if (this._coordinates) {
        formData.append("lat", this._coordinates.lat);
        formData.append("lon", this._coordinates.lon);
      }

      this._showNotification("Sedang mengirim cerita...", "loading");

      // Disable the submit button to prevent double submission
      const submitButton = document.getElementById("submit-btn");
      submitButton.disabled = true;

      const response = await addStory(formData);

      if (response.error === false) {
        this._showNotification("Cerita berhasil ditambahkan!", "success");

        // Stop camera if still active
        if (this._isCameraMode) {
          this._stopCamera();
        }

        // Set flag to force home page refresh
        window.sessionStorage.setItem("forceHomeRefresh", "true");

        // Redirect ke halaman utama setelah 2 detik
        setTimeout(() => {
          window.location.hash = "#/";
        }, 2000);
      } else {
        this._showNotification(
          response.message || "Gagal menambahkan cerita",
          "error"
        );
        // Re-enable the submit button
        submitButton.disabled = false;
      }
    } catch (error) {
      this._showNotification(
        error.message || "Terjadi kesalahan saat mengirim cerita",
        "error"
      );
      // Re-enable the submit button
      submitButton.disabled = false;
    }
  }

  _showNotification(message, type = "info") {
    this._notificationElement.textContent = message;
    this._notificationElement.className = `alert alert-${type}`;
    this._notificationElement.classList.remove("hidden");

    if (type !== "loading") {
      setTimeout(() => {
        this._notificationElement.classList.add("hidden");
      }, 5000);
    }
  }
}

export default CreateStoryPage;
