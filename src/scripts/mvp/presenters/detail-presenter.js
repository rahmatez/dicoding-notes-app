import StoryModel from "../models/story-model";
import { checkAuth } from "../../utils";

class DetailPresenter {
  constructor({ model, view }) {
    this._model = model || new StoryModel();
    this._view = view;
    this._storyId = null;
    this._currentStory = null;

    // Bind methods for cleanup and event handling
    this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
    this._handleFavoriteToggle = this._handleFavoriteToggle.bind(this);

    // Set up event handlers
    this._view.setFavoriteHandler(this._handleFavoriteToggle);
    this._view.setBeforeUnloadHandler(this._handleBeforeUnload);
    this._view.setHashChangeHandler(this._handleBeforeUnload);
  }

  async init(storyId) {
    console.log("DetailPresenter init with storyId:", storyId);

    // Clean up previous state if any
    if (this._storyId) {
      this._view.cleanup();
    }

    this._storyId = storyId;
    this._view.initElements();

    // Event listeners are now registered through the view in the constructor

    // Check if we have a valid story ID
    if (!storyId) {
      this._view.showErrorMessage("ID cerita tidak valid");
      return;
    }

    // Check if user is logged in
    const isLoggedIn = checkAuth();
    if (!isLoggedIn) {
      this._view.showErrorMessage(
        "Anda perlu login untuk melihat detail cerita"
      );
      return;
    }

    await this._fetchStoryDetail();
  }

  async _fetchStoryDetail() {
    this._view.showLoading();

    try {
      console.log("Fetching story detail for ID:", this._storyId);
      const story = await this._model.getStoryDetail(this._storyId);

      if (!story) {
        throw new Error("Data cerita tidak ditemukan");
      }

      // Store current story for later use
      this._currentStory = story;

      // Check if story is liked before passing to view
      const isLiked = await this._model.isStoryLiked(story.id);
      story.isLiked = isLiked; // Attach isLiked status to the story object

      await this._view.displayStory(story);
      this._view.hideLoading();
    } catch (error) {
      console.error("Error fetching story detail:", error);
      this._view.showErrorMessage(
        error.message || "Terjadi kesalahan saat memuat detail cerita"
      );
    }
  }

  // Handle favorite button click
  async _handleFavoriteToggle(story, isLiked) {
    try {
      if (isLiked) {
        // Remove from favorites
        await this._model.unlikeStory(story.id);
        console.log("Story removed from favorites");

        // Update the story's like status
        story.isLiked = false;
      } else {
        // Add to favorites
        await this._model.likeStory(story);
        console.log("Story added to favorites");

        // Update the story's like status
        story.isLiked = true;
      }

      // Update the UI with the new favorite status
      await this._view.displayStory(story);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  }

  // Handle cleanup when navigating away or page is refreshed
  _handleBeforeUnload() {
    console.log("Cleaning up detail view resources");
    this._view.cleanup();

    // Remove event listeners through the view
    this._view.removeEventListeners();
  }

  // Method that can be called from outside to clean up resources
  destroy() {
    this._handleBeforeUnload();
  }
}

export default DetailPresenter;
