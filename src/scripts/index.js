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

// Request notification permission with alert/prompt
const requestNotificationPermission = async () => {
  if ("Notification" in window && "PushManager" in window) {
    if (Notification.permission === "default") {
      // Show alert/prompt to inform user about notification
      const userWantsNotifications = confirm(
        "Aplikasi ini ingin mengirimkan notifikasi ketika ada cerita baru. " +
          "Apakah Anda mengizinkan notifikasi?"
      );

      if (userWantsNotifications) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            console.log("Notification permission granted");
            // Try to register for web push after permission granted
            await registerWebPush();
          } else {
            console.log("Notification permission denied");
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      } else {
        console.log("User declined notification prompt");
      }
    } else if (Notification.permission === "granted") {
      // Already granted, register for web push
      await registerWebPush();
    } else {
      console.log("Notification permission was previously denied");
    }
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

  // Request notification permission with alert/prompt
  if (checkAuth()) {
    // Only request permission if user is logged in
    await requestNotificationPermission();
  } else {
    // If not logged in, still check and register if permission already granted
    if (Notification.permission === "granted") {
      await registerWebPush();
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
    event.preventDefault(); // Mencegah navigasi default
    event.stopPropagation(); // Mencegah event bubbling

    skipLink.blur(); // Menghilangkan fokus skip to content

    // Focus pada konten utama yang spesifik dari halaman saat ini
    // Cari elemen utama dari halaman yang sedang aktif
    const pageTitle = mainContent.querySelector("h1");
    const primaryContent = mainContent.querySelector(
      "section, article, .container, .main-content-area"
    );

    // Prioritas focus: h1 (judul halaman) > primary content > main container
    let targetElement = pageTitle || primaryContent || mainContent;

    // Pastikan elemen dapat di-focus dengan menambahkan tabindex jika diperlukan
    if (!targetElement.hasAttribute("tabindex")) {
      targetElement.setAttribute("tabindex", "-1");
    }

    // Focus pada elemen target tanpa scroll terlebih dahulu
    targetElement.focus();

    // Scroll ke elemen target dengan smooth behavior setelah focus
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }, 50);

    return false; // Pastikan tidak ada navigasi
  });
});
