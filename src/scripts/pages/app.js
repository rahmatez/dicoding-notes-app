import routes, { notFoundRoute } from "../routes/routes";
import {
  getActiveRoute,
  getActivePathname,
  parseActivePathname,
} from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentRoute = null;
  #cachedHomePageContent = null;
  #isHomePageLoaded = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#currentRoute = null;

    this._setupDrawer();
    this._initNavigationHandler();
    this._setupContentLinkHandler();
    this._setupCustomNavEvents();
  }

  _setupContentLinkHandler() {
    // Menangani klik pada semua link dalam konten, termasuk "Baca selengkapnya" dan "Lihat Lokasi"
    this.#content.addEventListener("click", async (event) => {
      const linkElement = event.target.closest("a");

      // Debug untuk membantu identifikasi masalah klik
      if (linkElement) {
        console.log(
          "Link clicked:",
          linkElement.getAttribute("href"),
          linkElement.className
        );
      }

      // Pastikan elemen adalah link dan memiliki href yang dimulai dengan #
      if (
        linkElement &&
        linkElement.getAttribute("href") &&
        linkElement.getAttribute("href").startsWith("#")
      ) {
        event.preventDefault();

        const href = linkElement.getAttribute("href");
        const path = href.substring(1);

        console.log("Navigating to:", path);

        // Update URL hash
        window.location.hash = path;

        // Langsung render halaman tanpa menunggu event hashchange
        await this.renderPage();
      }
    });
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      // Tutup drawer ketika link di dalamnya diklik
      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _initNavigationHandler() {
    // Menangani klik pada semua link navigasi dan juga link "Baca selengkapnya"
    const navLinks = document.querySelectorAll(
      "nav a:not(#logout-button), header a:not(#logout-button)"
    );

    navLinks.forEach((link) => {
      const newLink = link.cloneNode(true);
      if (link.parentNode) {
        link.parentNode.replaceChild(newLink, link);
      }

      newLink.addEventListener("click", async (event) => {
        event.preventDefault();

        const href = newLink.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const path = href.substring(1);

        const isHomePage = path === "/" || path === "";

        if (isHomePage && this.#isHomePageLoaded) {
          console.log("Home page link clicked, will use cached content");
        }

        // Update URL hash
        window.location.hash = path;

        // PENTING: Langsung render halaman tanpa menunggu event hashchange
        // Ini kunci agar hanya perlu 1x klik
        await this.renderPage();
      });
    });

    // Juga tangani hashchange untuk browser back/forward
    window.addEventListener("hashchange", async () => {
      await this.renderPage();
    });

    // Menangani refresh halaman (menghapus cache)
    window.addEventListener("beforeunload", () => {
      this.#cachedHomePageContent = null;
      this.#isHomePageLoaded = false;
    });
  }

  async renderPage() {
    try {
      // Ambil rute aktif dari URL
      const url = getActiveRoute();
      const pathname = getActivePathname();
      console.log(
        "Rendering page for route:",
        url,
        "Pathname:",
        pathname,
        "Hash:",
        window.location.hash
      );

      // Execute cleanup for previous route if available
      const currentPage = routes[this.#currentRoute];
      if (currentPage && typeof currentPage.onLeave === "function") {
        console.log(
          `Executing cleanup for previous route: ${this.#currentRoute}`
        );
        currentPage.onLeave();
      }

      // Save previous route before updating current route
      const previousRoute = this.#currentRoute;
      sessionStorage.setItem("previousRoute", previousRoute || "");

      // Save current route for tracking navigation
      this.#currentRoute = url;
      sessionStorage.setItem("currentRoute", url);

      // Special case for home page navigation
      if (url === "/" && previousRoute !== "/" && previousRoute !== null) {
        console.log("Navigation to home page from another page");
        // Force cache clearing when coming from another page to home
        this.#cachedHomePageContent = null;
        this.#isHomePageLoaded = false;
      }

      // Check if we have a refresh flag in session storage (after login)
      const forceRefresh =
        window.sessionStorage.getItem("forceHomeRefresh") === "true";
      if (forceRefresh) {
        // Clear cache if refresh flag is present
        this.#cachedHomePageContent = null;
        this.#isHomePageLoaded = false;

        // Remove the flag from session storage
        window.sessionStorage.removeItem("forceHomeRefresh");
      }

      // Ambil halaman berdasarkan rute
      const page = routes[url];

      if (!page) {
        console.warn(
          `Route untuk ${url} tidak ditemukan, menampilkan halaman 404`
        );
        // Tampilkan halaman 404 Not Found
        const notFoundHTML = await notFoundRoute.render();
        this.#content.innerHTML = notFoundHTML;
        await notFoundRoute.afterRender();
        return;
      }

      try {
        // Untuk halaman beranda, kita akan selalu merender ulang untuk memastikan data terbaru
        // Kecuali jika klik untuk kedua kalinya dalam satu sesi
        const isNavbarHomeClick =
          url === "/" &&
          this.#currentRoute === "/" &&
          this.#isHomePageLoaded &&
          !forceRefresh;

        if (isNavbarHomeClick && this.#cachedHomePageContent) {
          console.log("Using cached home page content");

          // Gunakan View Transitions API jika didukung browser
          if (document.startViewTransition) {
            await document.startViewTransition(() => {
              // Gunakan konten dari cache
              this.#content.innerHTML = this.#cachedHomePageContent;

              // Update highlight menu aktif
              this._updateActiveMenu(url);
            }).finished;
          } else {
            // Fallback
            this.#content.innerHTML = this.#cachedHomePageContent;
            this._updateActiveMenu(url);
          }
        } else {
          // Untuk halaman lain atau saat pertama kali muat beranda
          // Gunakan View Transitions API jika didukung browser
          if (document.startViewTransition) {
            await document.startViewTransition(async () => {
              // Render content
              const content = await page.render();

              // Update DOM dengan konten baru
              this.#content.innerHTML = content;

              // Extract URL parameters if any
              const pathname = getActivePathname();
              const params = pathname.split("/");

              // Pass parameters to afterRender for special routes
              if (url === "/maps/:lat/:lon" && params.length >= 4) {
                await page.afterRender(params[2], params[3]);
              } else if (url === "/detail/:id" && params.length >= 3) {
                await page.afterRender(params[2]);
              } else {
                await page.afterRender();
              }

              // Jika ini halaman beranda, simpan ke cache
              if (url === "/") {
                this.#cachedHomePageContent = this.#content.innerHTML;
                this.#isHomePageLoaded = true;
              }

              // Update highlight menu aktif
              this._updateActiveMenu(url);
            }).finished;
          } else {
            // Fallback untuk browser yang tidak mendukung View Transitions API
            // Render content
            const content = await page.render();

            // Update DOM dengan konten baru
            this.#content.innerHTML = content;

            // Extract URL parameters if any
            const pathname = getActivePathname();
            const params = pathname.split("/");

            // Pass parameters to afterRender for special routes
            if (url === "/maps/:lat/:lon" && params.length >= 4) {
              await page.afterRender(params[2], params[3]);
            } else if (url === "/detail/:id" && params.length >= 3) {
              await page.afterRender(params[2]);
            } else {
              await page.afterRender();
            }

            // Jika ini halaman beranda, simpan ke cache
            if (url === "/") {
              this.#cachedHomePageContent = this.#content.innerHTML;
              this.#isHomePageLoaded = true;
            }

            // Update highlight menu aktif
            this._updateActiveMenu(url);
          }
        } // Scroll ke atas halaman setelah navigasi
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Update status login/logout di UI
        if (typeof updateNavigationUI === "function") {
          updateNavigationUI();
        }

        // Setup logout button kembali jika ada
        if (typeof setupLogoutButton === "function") {
          setupLogoutButton();
        }

        console.log(`Page rendered successfully for: ${url}`);
        return true;
      } catch (renderError) {
        console.error("Error rendering page content:", renderError);
        return false;
      }
    } catch (error) {
      console.error("Fatal error in renderPage:", error);
      return false;
    }
  }

  _setupCustomNavEvents() {
    // Fungsi ini telah digantikan oleh _initNavigationHandler
    console.log("Navigation handler initialized");
  }

  _updateActiveMenu(url) {
    // Remove active class from all links
    document.querySelectorAll("header a, nav a").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current route link
    try {
      // Extract base route without parameters (e.g., /detail/:id -> /detail)
      let baseUrl = url;
      if (url.includes("/:")) {
        baseUrl = url.split("/:")[0];
      }

      // Handle special cases
      let selector;
      if (url === "/") {
        selector = 'a[href="#/"]';
      } else if (baseUrl !== url) {
        // For routes with parameters, look for the base route in href attribute
        selector = `a[href^="#${baseUrl}"]`;
      } else {
        selector = `a[href="#${url}"]`;
      }

      const activeLink = document.querySelector(selector);
      if (activeLink) {
        activeLink.classList.add("active");
        console.log("Active menu updated for:", baseUrl);
      } else if (baseUrl !== "/detail" && baseUrl !== "/maps") {
        // Only warn for non-detail and non-map pages since they might not have menu items
        console.warn(`No menu item found for selector: ${selector}`);
      }
    } catch (error) {
      console.error("Error updating active menu:", error);
    }
  }
}

export default App;
