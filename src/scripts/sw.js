import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { clientsClaim } from "workbox-core";

// Use clientsClaim to take control immediately
clientsClaim();
self.skipWaiting();

// Precaching
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        maxEntries: 30,
      }),
    ],
  })
);

// Cache CSS and JavaScript files with a stale-while-revalidate strategy
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

// Cache images with a cache-first strategy
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// API routes using NetworkFirst strategy
registerRoute(
  new RegExp("https://story-api\\.dicoding\\.dev/v1/"),
  new NetworkFirst({
    cacheName: "api-responses",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// HTML routes using NetworkFirst
registerRoute(
  /\.html$/,
  new NetworkFirst({
    cacheName: "html-responses",
  })
);

// Default route - NetworkFirst with cache fallback
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "document-cache",
  })
);

// Handle push events for notifications
self.addEventListener("push", (event) => {
  const notificationData = event.data?.text()
    ? JSON.parse(event.data.text())
    : {
        title: "New Story Notification",
        options: {
          body: "Someone shared a new story!",
          icon: "/images/icons/icon-192x192.png",
          badge: "/images/icons/icon-72x72.png",
        },
      };

  const showNotification = self.registration.showNotification(
    notificationData.title || "New Notification",
    notificationData.options || {}
  );

  event.waitUntil(showNotification);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window already exists, focus it
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // If no window exists, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

// Tambahan: Offline fallback page
// Menampilkan halaman offline ketika pengguna tidak dapat mengakses halaman dan tidak ada cache
registerRoute(
  ({ request, url }) =>
    request.destination === "document" && !url.pathname.startsWith("/offline"),
  new NetworkFirst({
    cacheName: "pages",
    plugins: [
      {
        handlerDidError: async () => {
          // Jika terjadi error, cek apakah halaman offline ada di cache
          // Jika ada, kembalikan halaman offline
          const cache = await caches.open("pages");
          return cache.match("/offline.html");
        },
      },
    ],
  })
);

// Offline page
self.addEventListener("install", (event) => {
  const offlineFallbackPage = new Request("/offline.html");
  event.waitUntil(
    fetch(offlineFallbackPage)
      .then((response) => {
        return caches.open("pages").then((cache) => {
          console.log("[Service Worker] Cached offline page");
          return cache.put(offlineFallbackPage, response);
        });
      })
      .catch((err) =>
        console.error("[Service Worker] Error caching offline page:", err)
      )
  );
});
