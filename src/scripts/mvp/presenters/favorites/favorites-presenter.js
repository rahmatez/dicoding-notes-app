import { checkAuth } from "../../../utils";

class FavoritesPresenter {
  constructor({ model, view }) {
    this._model = model;
    this._view = view;

    // Initialize event handler for unlike button
    this._view.setUnlikeHandler((id) => this._handleUnlike(id));
  }

  async init() {
    // Check if user is authenticated
    if (!checkAuth()) {
      this._view.showError("Anda harus login untuk melihat daftar favorit");
      return;
    }

    // Initialize view and fetch data
    this._view.initElements();
    await this._fetchFavoriteStories();
  }

  async _fetchFavoriteStories() {
    this._view.showLoading();

    try {
      const favoriteStories = await this._model.getLikedStories();

      // Sort stories by likedAt timestamp (newest first)
      favoriteStories.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));

      this._view.renderStories(favoriteStories);
    } catch (error) {
      console.error("Failed to fetch favorite stories:", error);
      this._view.showError(error.message || "Gagal memuat cerita favorit");
    } finally {
      this._view.hideLoading();
    }
  }

  async _handleUnlike(id) {
    try {
      // Remove from favorites in IndexedDB
      await this._model.unlikeStory(id);

      // Tidak perlu refresh karena UI sudah diupdate di view
      console.log("Story removed from favorites");

      // Tampilkan toast atau notifikasi (opsional)
      // this._view.showToast('Cerita berhasil dihapus dari favorit');
    } catch (error) {
      console.error("Failed to unlike story:", error);
      this._view.showError("Gagal menghapus cerita dari favorit");
    }
  }
}

export default FavoritesPresenter;
