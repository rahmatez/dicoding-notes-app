import CONFIG from "../config";
import RouterHelper from "./router-helper";
export * from "./map-helper";
export { RouterHelper };

export function showFormattedDate(
  date,
  locale = CONFIG.DEFAULT_LANG,
  options = {}
) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function showFormattedTime(date, locale = CONFIG.DEFAULT_LANG) {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function showFormattedDateTime(date, locale = CONFIG.DEFAULT_LANG) {
  return `${showFormattedDate(date, locale)} ${showFormattedTime(
    date,
    locale
  )}`;
}

export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY) || null;
}

export function saveToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

export function saveUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem(CONFIG.USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem(CONFIG.USER_KEY);
}

export function checkAuth() {
  return !!getToken();
}

export function logout() {
  removeToken();
  removeUser();

  // Clear liked stories from IndexedDB on logout
  import("../data/story-idb").then(({ default: StoryIdb }) => {
    StoryIdb.clearLikedStories().catch(console.error);
  });

  window.location.hash = "#/";
}

export function createUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
