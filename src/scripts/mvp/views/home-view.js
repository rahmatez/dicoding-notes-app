import { checkAuth, showFormattedDateTime } from "../../utils";

class HomeView {
  constructor() {
    this._storiesContainer = null;
    this._loadingElement = null;
    this._errorContainer = null;
  }

  getTemplate() {
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

  initElements() {
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

    // Setup view transitions for links
    document.documentElement.addEventListener("click", (event) => {
      const target = event.target.closest("a");
      if (target && target.href && target.href.includes("#/")) {
        // Log untuk debugging
        console.log(
          "Link clicked in home-view:",
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

    return this;
  }

  showLoading() {
    if (this._loadingElement) {
      this._loadingElement.classList.remove("hidden");
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

  showWelcomeMessage() {
    if (this._storiesContainer) {
      this._storiesContainer.innerHTML = `
        <div class="welcome-message">
          <h2>Selamat Datang di Dicoding Story</h2>
          <p>Silahkan <a href="#/login">Masuk</a> untuk melihat cerita dari komunitas Dicoding.</p>
          <p>Belum punya akun? <a href="#/register">Daftar</a> sekarang!</p>
        </div>
      `;
    }
  }

  renderStories(stories) {
    if (!this._storiesContainer) return;

    // Check if there are any duplicate stories already rendered
    const existingStoryIds = Array.from(
      this._storiesContainer.querySelectorAll(".story-card")
    ).map((card) => card.id.replace("story-", ""));

    // Only render stories that aren't already displayed
    stories.forEach((story) => {
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
        ? `<a href="#/maps/${story.lat}/${story.lon}" class="story-card__map-link" title="Lihat lokasi di peta">
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
        <p class="story-card__date">
          <i class="fas fa-calendar-alt"></i> ${showFormattedDateTime(
            story.createdAt
          )}
        </p>
        <p class="story-card__description">${story.description}</p>
        <div class="story-card__actions">
          <a href="#/detail/${
            story.id
          }" class="story-card__read-more">Baca selengkapnya</a>
          ${mapLink}
        </div>
      </div>
    `;

    return storyCard;
  }
}

export default HomeView;
