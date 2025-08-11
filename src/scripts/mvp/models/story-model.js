import { getAllStories, getStoryDetail, addStory } from "../../data/api";
import StoryIdb from "../../data/story-idb";

class StoryModel {
  constructor() {
    this._stories = [];
    this._currentPage = 1;
    this._hasMoreStories = true;
    this._isOffline = false;
  }

  async getStories(page = 1, size = 10, withLocation = false) {
    try {
      // Try fetching from network first
      const data = await getAllStories({
        page: page,
        size: size,
        location: withLocation ? 1 : 0,
      });

      const { listStory } = data;
      this._hasMoreStories = listStory.length > 0;
      this._isOffline = false;

      if (page === 1) {
        this._stories = listStory;
      } else {
        this._stories = [...this._stories, ...listStory];
      }

      // Note: Stories are now cached via service worker instead of IndexedDB
      // IndexedDB is only used for favorites/likes

      this._currentPage = page + 1;
      return listStory;
    } catch (error) {
      console.log("Network request failed:", error);
      this._isOffline = true;

      // In offline mode, return empty array - service worker cache will handle offline content
      // IndexedDB no longer stores general story data, only favorites
      this._stories = [];
      this._hasMoreStories = false;
      throw error; // Let the service worker handle offline scenarios

      throw new Error(error.message || "Gagal memuat cerita");
    }
  }

  async getStoryDetail(id) {
    try {
      if (!id) {
        throw new Error("ID cerita tidak valid");
      }

      console.log("Fetching story detail for ID:", id);

      // Try fetching from network (service worker will handle caching)
      const response = await getStoryDetail(id);

      if (!response || !response.story) {
        console.error("Invalid story detail response:", response);
        throw new Error("Data cerita tidak ditemukan");
      }

      return response.story;
    } catch (error) {
      console.error("Error in model.getStoryDetail:", error);
      throw new Error(error.message || "Gagal memuat detail cerita");
    }
  }

  async addStory(formData) {
    try {
      const response = await addStory(formData);
      return response;
    } catch (error) {
      console.error("Error adding story:", error);
      throw error; // Let presenter handle the error
    }
  }

  get currentPage() {
    return this._currentPage;
  }

  get hasMoreStories() {
    return this._hasMoreStories;
  }

  get stories() {
    return [...this._stories];
  }

  get isOffline() {
    return this._isOffline;
  }

  resetState() {
    this._stories = [];
    this._currentPage = 1;
    this._hasMoreStories = true;
    this._isOffline = false;
  }

  // Methods for managing liked stories only
  async likeStory(story) {
    return StoryIdb.putLikedStory(story);
  }

  async unlikeStory(id) {
    return StoryIdb.removeLikedStory(id);
  }

  async isStoryLiked(id) {
    return StoryIdb.isStoryLiked(id);
  }

  async getLikedStories() {
    return StoryIdb.getLikedStories();
  }
}

export default StoryModel;
