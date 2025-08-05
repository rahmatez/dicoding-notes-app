import { checkAuth } from "../../utils";

class HomePresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._isLoading = false;
  }

  async init() {
    // Initialize the view elements
    this._view.initElements();

    // Only fetch stories if user is logged in
    if (checkAuth()) {
      // Selalu reset state ketika membuka halaman beranda untuk memastikan data segar
      // kecuali sudah ada data sebelumnya dan bukan navigasi pertama
      const forceRefresh =
        sessionStorage.getItem("forceHomeRefresh") === "true";
      const isNavigationFromOtherPage =
        sessionStorage.getItem("lastRoute") !== "/";

      if (
        forceRefresh ||
        isNavigationFromOtherPage ||
        this._model.stories.length === 0
      ) {
        console.log("Resetting story model state to get fresh data");
        // Reset model state to get fresh data
        this._model.resetState();

        if (forceRefresh) {
          // Clear flag
          sessionStorage.removeItem("forceHomeRefresh");
        }
      }

      // Save current route for next navigation
      sessionStorage.setItem("lastRoute", "/");

      // Fetch stories immediately without delay to prevent blank page
      await this._fetchStories();

      // Infinite scroll only for logged in users
      window.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } =
          document.documentElement;
        if (
          scrollTop + clientHeight >= scrollHeight - 10 &&
          !this._isLoading &&
          this._model.hasMoreStories
        ) {
          this._fetchStories();
        }
      });
    }
  }

  async _fetchStories() {
    try {
      // If user is not logged in, we don't need to fetch stories
      if (!checkAuth()) {
        // Welcome message is already shown in render() method
        return;
      }

      this._isLoading = true;
      this._view.showLoading();

      // Fetch stories only if user is logged in
      const stories = await this._model.getStories(
        this._model.currentPage,
        10,
        true
      );

      if (stories.length > 0) {
        this._view.renderStories(stories);
      }

      this._view.hideLoading();
      this._isLoading = false;
    } catch (error) {
      this._view.hideLoading();
      this._isLoading = false;

      if (!checkAuth()) {
        // If not logged in, the welcome message is already shown
      } else {
        this._view.showError(error.message || "Gagal memuat cerita");
      }
    }
  }

  resetState() {
    this._model.resetState();
  }

  destroy() {
    // Clean up any resources or event listeners if needed
    console.log("Cleaning up home presenter");
  }
}

export default HomePresenter;
