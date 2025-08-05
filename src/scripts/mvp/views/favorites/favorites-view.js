class FavoritesView {
  constructor() {
    this._storiesContainer = null;
    this._loadingElement = null;
    this._errorContainer = null;
    this._emptyFavoritesElement = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="favorites-page">
          <h1>Cerita Favorit</h1>
          <p>Cerita-cerita yang Anda simpan sebagai favorit</p>
          
          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Memuat cerita favorit...</p>
          </div>
          
          <div id="error-container" class="alert alert-error hidden"></div>
          
          <div id="empty-favorites" class="empty-state hidden">
            <i class="fas fa-heart-broken"></i>
            <h2>Belum ada cerita favorit</h2>
            <p>Cerita yang Anda tandai sebagai favorit akan muncul di sini.</p>
            <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
          </div>
          
          <div id="stories-container" class="stories-grid"></div>
        </div>
      </section>
    `;
  }

  initElements() {
    this._storiesContainer = document.getElementById("stories-container");
    this._loadingElement = document.getElementById("loading");
    this._errorContainer = document.getElementById("error-container");
    this._emptyFavoritesElement = document.getElementById("empty-favorites");

    return this;
  }

  showLoading() {
    if (this._loadingElement) {
      this._loadingElement.classList.remove("hidden");
    }

    if (this._emptyFavoritesElement) {
      this._emptyFavoritesElement.classList.add("hidden");
    }
  }

  hideLoading() {
    if (this._loadingElement) {
      this._loadingElement.classList.add("hidden");
    }
  }

  showError(message) {
    if (this._errorContainer) {
      this._errorContainer.textContent = message;
      this._errorContainer.classList.remove("hidden");
    }
  }

  showEmptyFavorites() {
    if (this._emptyFavoritesElement) {
      this._emptyFavoritesElement.classList.remove("hidden");
    }
  }

  renderStories(stories) {
    if (!this._storiesContainer) return;

    // Clear existing content
    this._storiesContainer.innerHTML = "";

    if (stories.length === 0) {
      this.showEmptyFavorites();
      return;
    }

    stories.forEach((story) => {
      const storyElement = this._createStoryCard(story);
      this._storiesContainer.appendChild(storyElement);
    });
  }

  _createStoryCard(story) {
    const storyElement = document.createElement("div");
    storyElement.id = `story-${story.id}`;
    storyElement.className = "story-card";

    const imageUrl = story.photoUrl;
    const createdAt = new Date(story.createdAt).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const likedAt = story.likedAt
      ? new Date(story.likedAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    storyElement.innerHTML = `
      <div class="story-card__image-container">
        <img
          src="${imageUrl}"
          alt="Foto cerita dari ${story.name}"
          class="story-card__image"
          loading="lazy"
        />
        ${
          story.lat && story.lon
            ? `
          
        `
            : ""
        }
      </div>
      <div class="story-card__content">
        <h3 class="story-card__title">${story.name}</h3>
        <p class="story-card__desc">${story.description.substring(0, 100)}${
      story.description.length > 100 ? "..." : ""
    }</p>
        <div class="story-card__meta">
          <span class="story-card__date">
            <i class="far fa-calendar-alt"></i>
            ${createdAt}
          </span>
          <span class="story-card__liked">
            <i class="fas fa-heart"></i>
            Ditambahkan: ${likedAt}
          </span>
        </div>
        <div class="story-card__actions">
          <a href="#/detail/${story.id}" class="btn btn-sm">Lihat Detail</a>
          <button class="btn btn-sm btn-danger btn-unlike" data-id="${
            story.id
          }">
            <i class="fas fa-heart-broken"></i> Hapus dari Favorit
          </button>
        </div>
      </div>
    `;

    // Add event listener to unlike button
    storyElement
      .querySelector(".btn-unlike")
      .addEventListener("click", (event) => {
        event.preventDefault();
        const storyId = event.currentTarget.dataset.id;

        // Animasi dan hapus elemen dari DOM sebelum memanggil callback
        storyElement.style.transition = "opacity 0.3s, transform 0.3s";
        storyElement.style.opacity = "0";
        storyElement.style.transform = "scale(0.9)";

        setTimeout(() => {
          // Hapus elemen dari DOM
          storyElement.remove();

          // Periksa apakah masih ada story card di container
          const remainingCards =
            this._storiesContainer.querySelectorAll(".story-card");
          if (remainingCards.length === 0) {
            // Jika tidak ada story card tersisa, tampilkan pesan kosong
            this.showEmptyFavorites();
          }

          // Panggil callback untuk menghapus dari IndexedDB
          if (this._unlikeCallback) {
            this._unlikeCallback(storyId);
          }
        }, 300); // Tunggu animasi selesai
      });

    return storyElement;
  }

  setUnlikeHandler(handler) {
    this._unlikeCallback = handler;
  }
}

export default FavoritesView;
