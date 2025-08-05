class CreateStoryView {
  constructor() {
    this._formElement = null;
    this._notificationElement = null;
    this._previewContainer = null;
    this._locationSection = null;
    this._latitudeInput = null;
    this._longitudeInput = null;
    this._locationStatus = null;
    this._map = null;
    this._marker = null;

    // Camera properties
    this._toggleCameraButton = null;
    this._capturePhotoButton = null;
    this._retryPhotoButton = null;
    this._videoElement = null;
    this._photoPreviewElement = null;
    this._photoPlaceholder = null;
    this._photoInput = null;
    this._mediaStream = null;
    this._isCameraMode = false;
    this._capturedImage = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="create-story-container">
          <h1 class="page-title">Buat Cerita Baru</h1>

          <div id="notification" class="alert hidden"></div>

          <form id="create-story-form" class="create-story-form">
            <div class="form-group">
              <label for="description" class="form-label">Cerita Anda</label>
              <textarea 
                id="description" 
                name="description" 
                class="form-control" 
                required
                rows="4"
                placeholder="Ceritakan pengalaman Anda..."
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
                    <label for="photo" class="btn">
                      <i class="fas fa-upload"></i> Unggah Foto
                    </label>
                    <input 
                      type="file" 
                      id="photo" 
                      name="photo" 
                      accept="image/*" 
                      class="hidden"
                      required
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
              <div class="location-section">
                <div class="location-header">
                  <label class="form-label">Lokasi (Opsional)</label>
                  <div class="location-buttons">
                    <button type="button" id="get-location" class="btn btn-small">
                      <i class="fas fa-map-marker-alt"></i> Gunakan Lokasi Saat Ini
                    </button>
                    <button type="button" id="pick-location" class="btn btn-small btn-secondary">
                      <i class="fas fa-map"></i> Pilih Lokasi di Peta
                    </button>
                  </div>
                </div>
                <div id="location-status" class="location-status">Lokasi tidak digunakan</div>
                
                <!-- Peta untuk memilih lokasi -->
                <div id="location-map-container" class="location-map-container hidden">
                  <div id="location-map" style="height: 300px;"></div>
                  <div class="map-info">Klik pada peta untuk memilih lokasi</div>
                </div>
                
                <div class="location-inputs">
                  <div class="input-group">
                    <label for="latitude" class="form-label small">Latitude</label>
                    <input type="text" id="latitude" name="latitude" class="form-control" readonly>
                  </div>
                  <div class="input-group">
                    <label for="longitude" class="form-label small">Longitude</label>
                    <input type="text" id="longitude" name="longitude" class="form-control" readonly>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn">
                <i class="fas fa-paper-plane"></i> Kirim Cerita
              </button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  initElements() {
    this._formElement = document.getElementById("create-story-form");
    this._notificationElement = document.getElementById("notification");
    this._previewContainer = document.getElementById("preview-container");
    this._photoInput = document.getElementById("photo");
    this._photoPlaceholder = document.getElementById("placeholder");
    this._photoPreviewElement = document.getElementById("photo-preview");
    this._videoElement = document.getElementById("camera-preview");
    this._toggleCameraButton = document.getElementById("toggle-camera");
    this._capturePhotoButton = document.getElementById("capture-photo");
    this._retryPhotoButton = document.getElementById("retry-photo");
    this._getLocationButton = document.getElementById("get-location");
    this._pickLocationButton = document.getElementById("pick-location");
    this._latitudeInput = document.getElementById("latitude");
    this._longitudeInput = document.getElementById("longitude");
    this._locationStatus = document.getElementById("location-status");
    this._mapContainer = document.getElementById("location-map-container");
    this._locationMap = document.getElementById("location-map");
    this._map = null;
    this._marker = null;
    this._capturedImage = null;

    return this;
  }

  initEvents() {
    // Set up image preview on file select
    this._photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Stop camera if active
          this._stopCameraStream();

          // Show preview image
          this._photoPreviewElement.src = e.target.result;
          this._photoPreviewElement.classList.remove("hidden");
          this._videoElement.classList.add("hidden");
          this._photoPlaceholder.classList.add("hidden");

          // Reset camera mode
          this._isCameraMode = false;
          this._capturedImage = null;

          // Update buttons
          this._toggleCameraButton.innerHTML =
            '<i class="fas fa-camera"></i> Gunakan Kamera';
          this._capturePhotoButton.classList.add("hidden");
          this._retryPhotoButton.classList.add("hidden");
        };
        reader.readAsDataURL(file);
      } else {
        // Reset preview
        this._photoPreviewElement.classList.add("hidden");
        this._photoPlaceholder.classList.remove("hidden");
      }
    });

    // Toggle camera button
    this._toggleCameraButton.addEventListener("click", () => {
      this._handleToggleCamera();
    });

    // Capture photo button
    this._capturePhotoButton.addEventListener("click", () => {
      this._handleCapturePhoto();
    });

    // Retry photo button
    this._retryPhotoButton.addEventListener("click", () => {
      this._handleRetryPhoto();
    });

    // Preload Leaflet
    this._loadLeafletIfNeeded();
  }

  // Camera handling methods
  async _handleToggleCamera() {
    if (this._isCameraMode) {
      // Turn off camera
      this._stopCameraStream();
      this._toggleCameraButton.innerHTML =
        '<i class="fas fa-camera"></i> Gunakan Kamera';
      this._videoElement.classList.add("hidden");
      this._capturePhotoButton.classList.add("hidden");

      if (this._capturedImage) {
        // Show captured image
        this._photoPreviewElement.classList.remove("hidden");
      } else {
        // Show placeholder
        this._photoPlaceholder.classList.remove("hidden");
      }

      this._isCameraMode = false;
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        this._mediaStream = stream;
        this._videoElement.srcObject = stream;

        // Show camera preview
        this._videoElement.classList.remove("hidden");
        this._photoPreviewElement.classList.add("hidden");
        this._photoPlaceholder.classList.add("hidden");

        // Show capture button
        this._capturePhotoButton.classList.remove("hidden");
        this._retryPhotoButton.classList.add("hidden");

        // Update toggle button
        this._toggleCameraButton.innerHTML =
          '<i class="fas fa-times"></i> Tutup Kamera';

        this._isCameraMode = true;
      } catch (error) {
        console.error("Error accessing camera:", error);
        this.showNotification(
          "Tidak dapat mengakses kamera. Periksa izin browser.",
          "error"
        );
      }
    }
  }

  _handleCapturePhoto() {
    if (!this._isCameraMode || !this._mediaStream) return;

    // Create temporary canvas to capture frame
    const canvas = document.createElement("canvas");
    const videoWidth = this._videoElement.videoWidth;
    const videoHeight = this._videoElement.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(this._videoElement, 0, 0, videoWidth, videoHeight);

    // Get image as data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    // Store captured image data
    this._capturedImage = this._dataURLToFile(
      imageDataUrl,
      "camera_capture.jpg"
    );

    // Display captured photo
    this._photoPreviewElement.src = imageDataUrl;
    this._photoPreviewElement.classList.remove("hidden");
    this._videoElement.classList.add("hidden");
    this._photoPlaceholder.classList.add("hidden");

    // Set the file input's value to empty - this is important to avoid the invalid form control error
    // And then we'll use the captured image data directly instead
    this._photoInput.removeAttribute("required");

    // Update buttons
    this._capturePhotoButton.classList.add("hidden");
    this._retryPhotoButton.classList.remove("hidden");

    // Turn off camera stream
    this._stopCameraStream();
    this._isCameraMode = false;
    this._toggleCameraButton.innerHTML =
      '<i class="fas fa-camera"></i> Gunakan Kamera';
  }

  _handleRetryPhoto() {
    // Clear captured image
    this._capturedImage = null;
    this._photoPreviewElement.src = "";
    this._photoPreviewElement.classList.add("hidden");

    // Restore required attribute to file input since we're no longer using captured image
    this._photoInput.setAttribute("required", "");

    // Start camera again
    this._handleToggleCamera();
  }

  _stopCameraStream() {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
      this._videoElement.srcObject = null;
    }
  }

  _dataURLToFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
  async _loadLeafletIfNeeded() {
    if (typeof L === "undefined" || !L) {
      // Load Leaflet CSS
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

      // Load Leaflet JS
      if (!document.getElementById("leaflet-js")) {
        const leafletJS = document.createElement("script");
        leafletJS.id = "leaflet-js";
        leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletJS.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        leafletJS.crossOrigin = "";
        document.head.appendChild(leafletJS);

        // Wait for script to load
        await new Promise((resolve) => {
          leafletJS.onload = resolve;
        });
        console.log("Leaflet loaded successfully");
      }
    }
  }

  initMapEvents() {
    // Initialize map for location picking
    this._pickLocationButton.addEventListener("click", async () => {
      this._mapContainer.classList.remove("hidden");

      // Ensure Leaflet is loaded
      await this._loadLeafletIfNeeded();

      if (typeof L !== "undefined" && L) {
        // Initialize map if it doesn't exist
        if (!this._map) {
          const defaultLat = -6.2088; // Default to Jakarta
          const defaultLng = 106.8456;

          setTimeout(() => {
            this._map = L.map(this._locationMap).setView(
              [defaultLat, defaultLng],
              13
            );

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this._map);

            // Create custom icon for better visibility
            const customIcon = L.divIcon({
              html: `<i class="fas fa-map-marker-alt fa-2x" style="color: var(--error-color);"></i>`,
              className: "custom-map-marker",
              iconSize: [24, 40],
              iconAnchor: [12, 40],
            });

            // Add click handler to map
            this._map.on("click", (e) => {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;

              // Update marker position
              if (this._marker) {
                this._marker.setLatLng([lat, lng]);
              } else {
                this._marker = L.marker([lat, lng], { icon: customIcon }).addTo(
                  this._map
                );
              }

              // Update form fields
              this.setLocation(lat, lng);

              // Show success notification
              this._locationStatus.textContent = `Lokasi dipilih: ${lat.toFixed(
                6
              )}, ${lng.toFixed(6)}`;
              this._locationStatus.className = "location-status success";
            });

            // Update map size after display
            this._map.invalidateSize();
          }, 100);
        } else {
          // If map exists, just update its size
          setTimeout(() => {
            this._map.invalidateSize();
          }, 100);
        }
      } else {
        this._pickLocationButton.disabled = true;
        this._pickLocationButton.title = "Leaflet tidak tersedia";
      }
    });
  }

  bindFormSubmit(handler) {
    this._formElement.addEventListener("submit", (event) => {
      event.preventDefault();

      const description = document.getElementById("description").value;

      // Verify we have either a captured photo or a file input
      const fileInput = document.getElementById("photo");
      const photo =
        this._capturedImage || (fileInput.files && fileInput.files[0]);

      if (!photo) {
        this.showNotification(
          "Silakan pilih atau ambil foto terlebih dahulu",
          "error"
        );
        return;
      }

      const latitude = this._latitudeInput.value || null;
      const longitude = this._longitudeInput.value || null;

      handler(description, photo, latitude, longitude);
    });
  }

  bindGetLocation(handler) {
    this._getLocationButton.addEventListener("click", () => {
      handler();
    });
  }

  bindPickLocation(handler) {
    // If a custom handler is provided for pick location, use it
    if (handler) {
      this._pickLocationButton.addEventListener("click", () => {
        handler();
      });
    }
  }

  setLocation(latitude, longitude) {
    this._latitudeInput.value = latitude;
    this._longitudeInput.value = longitude;
    this._locationStatus.textContent = "Lokasi berhasil didapatkan";
    this._locationStatus.classList.add("success");
  }

  showLocationError(message) {
    this._locationStatus.textContent = message || "Gagal mendapatkan lokasi";
    this._locationStatus.classList.add("error");
  }

  showNotification(message, type = "info") {
    this._notificationElement.textContent = message;
    this._notificationElement.className = `alert alert-${type}`;
    this._notificationElement.classList.remove("hidden");

    if (type !== "loading") {
      setTimeout(() => {
        this._notificationElement.classList.add("hidden");
      }, 5000);
    }
  }

  resetForm() {
    this._formElement.reset();

    // Reset photo preview
    this._photoPreviewElement.src = "";
    this._photoPreviewElement.classList.add("hidden");
    this._photoPlaceholder.classList.remove("hidden");
    this._capturedImage = null;

    // Restore required attribute
    this._photoInput.setAttribute("required", "");

    // Stop and reset camera
    this._stopCameraStream();
    this._videoElement.classList.add("hidden");
    this._isCameraMode = false;
    this._capturePhotoButton.classList.add("hidden");
    this._retryPhotoButton.classList.add("hidden");
    this._toggleCameraButton.innerHTML =
      '<i class="fas fa-camera"></i> Gunakan Kamera';

    // Reset location
    this._latitudeInput.value = "";
    this._longitudeInput.value = "";
    this._locationStatus.textContent = "Lokasi tidak digunakan";
    this._locationStatus.className = "location-status";
    this._mapContainer.classList.add("hidden");

    // Reset map marker if exists
    if (this._marker && this._map) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }
  }
  /**
   * Updates the marker position on the map
   * @param {Number} latitude - Latitude
   * @param {Number} longitude - Longitude
   * @param {Number} zoom - Optional zoom level
   */
  updateMapMarker(latitude, longitude, zoom = null) {
    if (!this._map) return;

    // If marker doesn't exist, create it
    if (!this._marker) {
      // Create custom marker icon
      const customIcon = L.divIcon({
        html: `<i class="fas fa-map-marker-alt fa-2x" style="color: var(--error-color);"></i>`,
        className: "custom-map-marker",
        iconSize: [24, 40],
        iconAnchor: [12, 40],
      });

      // Create marker
      this._marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(this._map);
    } else {
      // Update existing marker
      this._marker.setLatLng([latitude, longitude]);
    }

    // Update map view
    if (zoom !== null) {
      this._map.setView([latitude, longitude], zoom, { animate: true });
    } else {
      this._map.panTo([latitude, longitude], { animate: true });
    }
  }
}

export default CreateStoryView;
