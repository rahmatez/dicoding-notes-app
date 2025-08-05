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

      // Store stories in IndexedDB for offline access
      await StoryIdb.putStories(listStory);

      this._currentPage = page + 1;
      return listStory;
    } catch (error) {
      console.log("Failed to fetch from network, trying IndexedDB", error);

      // If network request fails, try to get stories from IndexedDB
      try {
        const stories = await StoryIdb.getAllStories();
        if (stories && stories.length > 0) {
          this._isOffline = true;
          this._stories = stories;
          this._hasMoreStories = false; // Can't load more in offline mode
          return stories;
        }
      } catch (idbError) {
        console.error("IndexedDB error:", idbError);
      }

      throw new Error(error.message || "Gagal memuat cerita");
    }
  }

  async getStoryDetail(id) {
    try {
      if (!id) {
        throw new Error("ID cerita tidak valid");
      }

      console.log("Fetching story detail for ID:", id);

      try {
        // Try fetching from network first
        const response = await getStoryDetail(id);

        if (!response || !response.story) {
          console.error("Invalid story detail response:", response);
          throw new Error("Data cerita tidak ditemukan");
        }

        // Save to IndexedDB for offline access
        await StoryIdb.putStories([response.story]);

        return response.story;
      } catch (networkError) {
        console.log("Network request failed, trying IndexedDB", networkError);

        // If network request fails, try to get from IndexedDB
        const story = await StoryIdb.getStory(id);

        if (story) {
          return story;
        }

        // If not in IndexedDB either, throw original error
        throw networkError;
      }
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
      // If offline or network error, save as draft
      if (!navigator.onLine || error.message.includes("network")) {
        try {
          // Create a draft object from FormData
          const draftData = {
            description: formData.get("description"),
            timestamp: new Date().toISOString(),
            // We can't store File objects in IndexedDB directly
            // Instead we'll store a flag indicating there's a photo
            hasPhoto: formData.get("photo") !== null,
            latitude: formData.get("lat") || null,
            longitude: formData.get("lon") || null,
          };

          const draftId = await StoryIdb.saveDraft(draftData);

          throw new Error(
            `Anda sedang offline. Cerita disimpan sebagai draft (ID: ${draftId})`
          );
        } catch (draftError) {
          console.error("Failed to save draft:", draftError);
          throw new Error(error.message || "Gagal menambahkan cerita");
        }
      } else {
        throw new Error(error.message || "Gagal menambahkan cerita");
      }
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

  // Methods for managing liked stories
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

  // Methods for managing drafts
  async saveDraft(draftData) {
    return StoryIdb.saveDraft(draftData);
  }

  async getAllDrafts() {
    return StoryIdb.getAllDrafts();
  }

  async getDraft(id) {
    return StoryIdb.getDraft(id);
  }

  async deleteDraft(id) {
    return StoryIdb.deleteDraft(id);
  }

  async updateDraft(id, draftData) {
    return StoryIdb.updateDraft(id, draftData);
  }
}

export default StoryModel;
