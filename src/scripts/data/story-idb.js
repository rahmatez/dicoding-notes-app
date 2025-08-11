import { openDB } from "idb";
import CONFIG from "../config";

const DATABASE_NAME = "dicoding-story-db";
const DATABASE_VERSION = 1;
const LIKED_STORIES_STORE = "liked-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    // Create liked stories object store - only for favorites/likes
    if (!database.objectStoreNames.contains(LIKED_STORIES_STORE)) {
      database.createObjectStore(LIKED_STORIES_STORE, { keyPath: "id" });
      console.log(`${LIKED_STORIES_STORE} object store created`);
    }
  },
});

const StoryIdb = {
  // Liked stories management - save a story to favorites
  async putLikedStory(story) {
    const db = await dbPromise;
    const tx = db.transaction(LIKED_STORIES_STORE, "readwrite");
    const store = tx.objectStore(LIKED_STORIES_STORE);

    // Add liked timestamp
    story.likedAt = new Date().toISOString();

    await store.put(story);
    return story;
  },

  // Get all liked stories
  async getLikedStories() {
    const db = await dbPromise;
    return db.getAll(LIKED_STORIES_STORE);
  },

  // Check if a story is liked
  async isStoryLiked(id) {
    const db = await dbPromise;
    const story = await db.get(LIKED_STORIES_STORE, id);
    return !!story;
  },

  // Remove a story from liked stories
  async removeLikedStory(id) {
    const db = await dbPromise;
    await db.delete(LIKED_STORIES_STORE, id);
  },

  // Clear all liked stories (useful when logging out)
  async clearLikedStories() {
    const db = await dbPromise;
    await db.clear(LIKED_STORIES_STORE);
  },
};

export default StoryIdb;
