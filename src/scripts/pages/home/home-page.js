import { getAllStories, getGuestStories } from "../../data/api";
import { checkAuth, showFormattedDateTime } from "../../utils";

class HomePage {
  constructor() {
    this._stories = [];
    this._currentPage = 1;
    this._hasMoreStories = true;
    this._isLoading = false;
    this._storiesLoaded = false; // Untuk melacak apakah cerita sudah dimuat
  }

  async render() {
    // Reset page and story state when rendering - this helps when redirecting from login
    if (checkAuth()) {
      this._stories = [];
      this._currentPage = 1;
      this._hasMoreStories = true;
      this._storiesLoaded = false;
    }

    return `
      <section class="container">
        <div class="home-header">
          <h1>Cerita Terbaru</h1>
          <p>Jelajahi berbagai cerita menarik dari komunitas Dicoding</p>
        </div>

        <div id="stories-container" class="stories-grid">
          ${
            !checkAuth()
              ? `
            <div class="welcome-message">
              <h2>Selamat Datang di Dicoding Story</h2>
              <p>Silahkan <a href="#/login">Masuk</a> untuk melihat cerita dari komunitas Dicoding.</p>
              <p>Belum punya akun? <a href="#/register">Daftar</a> sekarang!</p>
            </div>
          `
              : `<div class="initial-loading">
                  <div class="spinner"></div>
                  <p>Memuat cerita...</p>
                </div>`
          }
        </div>
        
        <div id="loading" class="loading hidden">
          <div class="spinner"></div>
          <p>Memuat cerita...</p>
        </div>

        <div id="error-container" class="alert alert-error hidden"></div>
      </section>
    `;
  }

  async afterRender() {
    this._storiesContainer = document.getElementById("stories-container");
    this._loadingElement = document.getElementById("loading");
    this._errorContainer = document.getElementById("error-container");

    // If user is not logged in, we don't need to clear the welcome message
    if (checkAuth() && this._storiesContainer) {
      // Clear the container before fetching stories to prevent duplication
      this._storiesContainer.innerHTML = "";
    }

    // Reset error container if it exists
    if (this._errorContainer) {
      this._errorContainer.classList.add("hidden");
    }

    // Only fetch stories if user is logged in
    if (checkAuth()) {
      await this._fetchStories();

      // Infinite scroll only for logged in users
      window.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } =
          document.documentElement;
        if (
          scrollTop + clientHeight >= scrollHeight - 10 &&
          !this._isLoading &&
          this._hasMoreStories
        ) {
          this._fetchStories();
        }
      });
    }

    // Menerapkan View Transition API dan memastikan semua link berfungsi
    document.documentElement.addEventListener("click", (event) => {
      const target = event.target.closest("a");
      if (target && target.href && target.href.includes("#/")) {
        // Log untuk debugging
        console.log(
          "Link clicked in home-page:",
          target.href,
          target.className
        );

        if (document.startViewTransition) {
          event.preventDefault();
          document.startViewTransition(() => {
            window.location.href = target.href;
          });
        }
      }
    });
  }

  async _fetchStories() {
    try {
      // If user is not logged in, we don't need to fetch stories
      if (!checkAuth()) {
        // Welcome message is already shown in render() method
        return;
      }

      this._isLoading = true;
      this._showLoading();

      // Fetch stories only if user is logged in
      const data = await getAllStories({
        page: this._currentPage,
        size: 10,
        location: 1,
      });

      const { listStory } = data;

      if (listStory.length === 0) {
        this._hasMoreStories = false;
      } else {
        this._stories = [...this._stories, ...listStory];
        this._currentPage += 1;
        this._renderStories();
      }

      this._hideLoading();
      this._isLoading = false;
    } catch (error) {
      this._hideLoading();
      this._isLoading = false;

      if (!checkAuth()) {
        // If not logged in, the welcome message is already shown
      } else {
        this._showError(error.message || "Gagal memuat cerita");
      }
    }
  }

  _showWelcomeMessage() {
    this._storiesContainer.innerHTML = `
      <div class="welcome-message">
        <h2>Selamat Datang di Dicoding Story</h2>
        <p>Silahkan <a href="#/login">Masuk</a> untuk melihat cerita dari komunitas Dicoding.</p>
        <p>Belum punya akun? <a href="#/register">Daftar</a> sekarang!</p>
      </div>
    `;
  }

  _renderStories() {
    // Mark that we have stories loaded
    this._storiesLoaded = true;

    // Check if there are any duplicate stories already rendered
    const existingStoryIds = Array.from(
      this._storiesContainer.querySelectorAll(".story-card")
    ).map((card) => card.id.replace("story-", ""));

    // Only render stories that aren't already displayed
    this._stories.forEach((story) => {
      if (!existingStoryIds.includes(story.id)) {
        const storyElement = this._createStoryCard(story);
        this._storiesContainer.appendChild(storyElement);
      }
    });
  }

  _createStoryCard(story) {
    const storyCard = document.createElement("article");
    storyCard.classList.add("card", "story-card");
    storyCard.setAttribute("id", `story-${story.id}`);
    // Set unique view-transition-name for each card to avoid duplicate names
    storyCard.style.viewTransitionName = `story-card-element-${story.id}`;

    const mapLink =
      story.lat && story.lon
        ? `<a href="#/map?lat=${story.lat}&lon=${story.lon}" class="story-card__map-link" title="Lihat lokasi di peta">
           <i class="fas fa-map-marker-alt"></i> Lihat Lokasi
         </a>`
        : "";

    storyCard.innerHTML = `
      <img 
        src="${story.photoUrl}" 
        alt="Foto dari ${story.name}"
        class="story-card__image"
      >
      <div class="story-card__content">
        <h2 class="story-card__title">
          <a href="#/detail/${story.id}">${story.name}</a>
        </h2>
        <div class="story-card__meta">
          <span><i class="fas fa-calendar"></i> ${showFormattedDateTime(
            story.createdAt
          )}</span>
          ${mapLink}
        </div>
        <p class="story-card__description">${story.description}</p>
        <a href="#/detail/${
          story.id
        }" class="btn story-card__read-more">Baca selengkapnya</a>
      </div>
    `;

    return storyCard;
  }

  _showLoading() {
    this._loadingElement.classList.remove("hidden");
  }

  _hideLoading() {
    this._loadingElement.classList.add("hidden");
  }

  _showError(message) {
    // Jika error berkaitan dengan authentication untuk user yang belum login,
    // tampilkan pesan selamat datang sebagai gantinya
    if (
      !checkAuth() &&
      (message.includes("authentication") ||
        message.includes("token") ||
        message.includes("Missing authentication"))
    ) {
      this._showWelcomeMessage();
      return;
    }

    this._errorContainer.textContent = message;
    this._errorContainer.classList.remove("hidden");
  }
}

export default HomePage;
