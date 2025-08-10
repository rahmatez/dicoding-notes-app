import App from "./pages/app";
import { checkAuth, getUser, logout } from "./utils";
import { urlBase64ToUint8Array } from "./utils";
import CONFIG from "./config";

// CSS imports - terpisah dari logika kode untuk menghindari masalah
import "../styles/styles.css";

// Register Service Worker (only in production)
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    try {
      // Use the correct path relative to the server root
      await navigator.serviceWorker.register("./sw.bundle.js");
      console.log("Service worker registered");
    } catch (error) {
      console.error("Failed to register service worker:", error);
    }
  }
};

// Handle navigation/authentication UI
const updateNavigationUI = () => {
  const isLoggedIn = checkAuth();
  const user = getUser();
  const loginMenu = document.getElementById("login-menu");
  const registerMenu = document.getElementById("register-menu");
  const logoutMenu = document.getElementById("logout-menu");
  const favoritesMenu = document.getElementById("favorites-menu");
  const createMenu = document.getElementById("create-menu");

  if (isLoggedIn && user) {
    loginMenu.classList.add("hidden");
    registerMenu.classList.add("hidden");
    logoutMenu.classList.remove("hidden");

    // Show features that require login
    if (favoritesMenu) favoritesMenu.classList.remove("hidden");
    if (createMenu) createMenu.classList.remove("hidden");
  } else {
    loginMenu.classList.remove("hidden");
    registerMenu.classList.remove("hidden");
    logoutMenu.classList.add("hidden");

    // Hide features that require login
    if (favoritesMenu) favoritesMenu.classList.add("hidden");
    if (createMenu) createMenu.classList.add("hidden");
  }
};

// Export function untuk bisa digunakan dari presenter
window.updateNavigationUI = updateNavigationUI;

// Setup logout button
const setupLogoutButton = () => {
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
      // Update navigation UI immediately after logout
      updateNavigationUI();
      // Redirect to home and reload page
      window.location.href = "#/";
      window.location.reload();
    });
  }
};

// Register Web Push
const registerWebPush = async () => {
  if ("PushManager" in window) {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;

      // Check if we already have a subscription
      let subscription =
        await serviceWorkerRegistration.pushManager.getSubscription();

      if (!subscription) {
        try {
          // Only attempt to subscribe if user is logged in and has granted permission
          if (checkAuth() && Notification.permission === "granted") {
            subscription =
              await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                  CONFIG.VAPID_PUBLIC_KEY
                ),
              });
          } else {
            // Don't try to subscribe if not logged in or permission not granted
            console.log(
              "Push notifications skipped - user not logged in or permission not granted"
            );
            return;
          }
        } catch (subscribeError) {
          console.error("Failed to subscribe to push:", subscribeError);
          return;
        }

        // Simpan subscription ke server
        if (checkAuth()) {
          try {
            const response = await fetch(
              `${CONFIG.BASE_URL}/notifications/subscribe`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(
                    CONFIG.TOKEN_KEY
                  )}`,
                },
                body: JSON.stringify({
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: btoa(
                      String.fromCharCode.apply(
                        null,
                        new Uint8Array(subscription.getKey("p256dh"))
                      )
                    ),
                    auth: btoa(
                      String.fromCharCode.apply(
                        null,
                        new Uint8Array(subscription.getKey("auth"))
                      )
                    ),
                  },
                }),
              }
            );

            const responseJson = await response.json();
            console.log("Web Push subscription:", responseJson);
          } catch (error) {
            console.error("Failed to register web push:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  }
};

// Navigasi sekarang sepenuhnya dikelola dalam class App
document.addEventListener("DOMContentLoaded", async () => {
  // Inisialisasi aplikasi
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Render halaman awal
  await app.renderPage();

  // Update UI navigasi
  updateNavigationUI();
  setupLogoutButton();

  // Register service worker dan web push
  await registerServiceWorker();

  // Only try to register for web push if service worker registration was successful
  // and we have the proper permissions
  if (Notification.permission !== "denied") {
    try {
      await registerWebPush();
    } catch (error) {
      console.log("Web Push registration skipped:", error.message);
    }
  }

  // Hashchange event handler untuk perubahan URL manual atau history back/forward
  window.addEventListener("hashchange", async (event) => {
    console.log(
      "hashchange event triggered from browser:",
      window.location.hash
    );

    // Render halaman terlebih dahulu
    await app.renderPage();

    // Gunakan View Transition API jika didukung
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        // Update UI setelah render halaman
        updateNavigationUI();
        setupLogoutButton();
      });
    } else {
      // Update UI tanpa transisi
      updateNavigationUI();
      setupLogoutButton();
    }
  });

  // Handle browser back/forward navigation
  window.addEventListener("popstate", async (event) => {
    console.log("popstate event triggered");
    await app.renderPage();
    updateNavigationUI();
    setupLogoutButton();
  });

  // Skip to content functionality for accessibility
  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");

  skipLink.addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah refresh halaman
    skipLink.blur(); // Menghilangkan fokus skip to content
    mainContent.focus(); // Fokus ke konten utama
    mainContent.scrollIntoView(); // Halaman scroll ke konten utama
  });
});
