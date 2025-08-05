import StoryModel from "../models/story-model";
import { checkAuth } from "../../utils";

class FavoritesPresenter {
  constructor({ view, model }) {
    this._model = model || new StoryModel();
    this._view = view;

    // Bind methods
    this._handleUnlikeStory = this._handleUnlikeStory.bind(this);
  }

  async init() {
    this._view.initElements();
    this._view.setUnlikeHandler(this._handleUnlikeStory);

    // Check auth first
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      this._view.showError("Anda perlu login untuk melihat cerita favorit");
      return;
    }

    await this._loadFavoriteStories();
  }

  async _loadFavoriteStories() {
    try {
      this._view.showLoading();

      const stories = await this._model.getLikedStories();

      if (stories && stories.length > 0) {
        // Sort by likedAt timestamp
        stories.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
        this._view.renderStories(stories);
      } else {
        this._view.showEmptyFavorites();
      }
    } catch (error) {
      console.error("Error loading favorite stories:", error);
      this._view.showError("Gagal memuat cerita favorit");
    } finally {
      this._view.hideLoading();
    }
  }

  async _handleUnlikeStory(storyId) {
    try {
      // Hapus dari IndexedDB tanpa perlu refresh halaman
      await this._model.unlikeStory(storyId);

      // Tidak perlu reload karena UI sudah diupdate di view
      console.log("Story removed from favorites successfully");
    } catch (error) {
      console.error("Error unliking story:", error);
      this._view.showError("Gagal menghapus cerita dari favorit");
    }
  }
}

export default FavoritesPresenter;
