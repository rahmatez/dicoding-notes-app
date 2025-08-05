import { openDB } from "idb";
import CONFIG from "../config";

const DATABASE_NAME = "dicoding-story-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";
const LIKED_STORIES_STORE = "liked-stories";
const DRAFT_STORIES_STORE = "draft-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    // Create stories object store
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
      console.log(`${OBJECT_STORE_NAME} object store created`);
    }

    // Create liked stories object store
    if (!database.objectStoreNames.contains(LIKED_STORIES_STORE)) {
      database.createObjectStore(LIKED_STORIES_STORE, { keyPath: "id" });
      console.log(`${LIKED_STORIES_STORE} object store created`);
    }

    // Create draft stories object store
    if (!database.objectStoreNames.contains(DRAFT_STORIES_STORE)) {
      const draftStore = database.createObjectStore(DRAFT_STORIES_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
      // Create indexes for searching drafts
      draftStore.createIndex("timestamp", "timestamp", { unique: false });
      console.log(`${DRAFT_STORIES_STORE} object store created`);
    }
  },
});

const StoryIdb = {
  // Store stories from API for offline access
  async putStories(stories) {
    if (!Array.isArray(stories)) {
      throw new Error("Parameter stories should be an array");
    }

    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);

    stories.forEach((story) => {
      store.put(story);
    });

    await tx.complete;
    return stories;
  },

  // Get all stories from IndexedDB
  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(OBJECT_STORE_NAME);
  },

  // Get a single story by ID
  async getStory(id) {
    const db = await dbPromise;
    return db.get(OBJECT_STORE_NAME, id);
  },

  // Delete a story by ID
  async deleteStory(id) {
    const db = await dbPromise;
    await db.delete(OBJECT_STORE_NAME, id);
  },

  // Clear all stories (useful when logging out)
  async clearStories() {
    const db = await dbPromise;
    await db.clear(OBJECT_STORE_NAME);
  },

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

  // Draft stories management
  async saveDraft(draftData) {
    const db = await dbPromise;
    const tx = db.transaction(DRAFT_STORIES_STORE, "readwrite");
    const store = tx.objectStore(DRAFT_STORIES_STORE);

    // Add timestamp for sorting
    draftData.timestamp = new Date().toISOString();

    const id = await store.add(draftData);
    await tx.complete;
    return id;
  },

  // Update an existing draft
  async updateDraft(id, draftData) {
    const db = await dbPromise;
    const tx = db.transaction(DRAFT_STORIES_STORE, "readwrite");
    const store = tx.objectStore(DRAFT_STORIES_STORE);

    // Update timestamp
    draftData.timestamp = new Date().toISOString();
    draftData.id = id;

    await store.put(draftData);
    await tx.complete;
    return id;
  },

  // Get all draft stories
  async getAllDrafts() {
    const db = await dbPromise;
    return db.getAll(DRAFT_STORIES_STORE);
  },

  // Get a single draft by ID
  async getDraft(id) {
    const db = await dbPromise;
    return db.get(DRAFT_STORIES_STORE, id);
  },

  // Delete a draft by ID
  async deleteDraft(id) {
    const db = await dbPromise;
    await db.delete(DRAFT_STORIES_STORE, id);
  },
};

export default StoryIdb;
