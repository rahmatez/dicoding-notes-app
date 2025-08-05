import CONFIG from "../config";
import { getToken } from "../utils";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  GUEST_STORY: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// Helper untuk fetch API dengan opsi yang tepat
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchOptions);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || "Terjadi kesalahan pada server");
  }

  return responseJson;
}

// Auth
export async function register(name, email, password) {
  return fetchWithAuth(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export async function login(email, password) {
  return fetchWithAuth(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// Stories
export async function getAllStories({
  page = 1,
  size = 10,
  location = 0,
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    location: location.toString(),
  });

  return fetchWithAuth(`${ENDPOINTS.STORIES}?${params}`);
}

// Get stories for guest (tidak memerlukan token)
export async function getGuestStories() {
  try {
    const response = await fetch(ENDPOINTS.GUEST_STORY);
    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(responseJson.message || "Missing authentication");
    }

    return responseJson;
  } catch (error) {
    console.error("Error fetching guest stories:", error);
    throw error;
  }
}

export async function getStoryDetail(id) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.STORY_DETAIL(id));

    // Log for debugging
    console.log("Story detail API response:", response);

    return response;
  } catch (error) {
    console.error("Error fetching story detail:", error);
    throw error;
  }
}

export async function addStory(formData, isGuest = false) {
  const endpoint = isGuest ? ENDPOINTS.GUEST_STORY : ENDPOINTS.STORIES;

  return fetchWithAuth(endpoint, {
    method: "POST",
    body: formData, // FormData sudah memiliki Content-Type multipart/form-data
  });
}

// Notifications
export async function subscribeNotification(subscription) {
  return fetchWithAuth(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
}

export async function unsubscribeNotification(endpoint) {
  return fetchWithAuth(ENDPOINTS.SUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });
}
