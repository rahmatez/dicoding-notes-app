/**
 * Router helper to abstract navigation without direct window access
 */
class RouterHelper {
  static navigate(path) {
    if (typeof window !== "undefined" && window.location) {
      window.location.hash = path;
      // Update navigation UI after navigation
      setTimeout(() => {
        if (typeof window.updateNavigationUI === "function") {
          window.updateNavigationUI();
        }
      }, 100);
    }
  }

  static getCurrentHash() {
    if (typeof window !== "undefined" && window.location) {
      return window.location.hash;
    }
    return "";
  }

  static getCurrentUrl() {
    if (typeof document !== "undefined" && document.URL) {
      return document.URL;
    }
    return "";
  }

  static redirect(path, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        this.navigate(path);
      }, delay);
    } else {
      this.navigate(path);
    }
  }

  static addEventListener(event, handler) {
    if (typeof window !== "undefined") {
      if (event === "scroll") {
        window.addEventListener(event, handler);
      } else {
        window.addEventListener(event, handler);
      }
    }
  }

  static removeEventListener(event, handler) {
    if (typeof window !== "undefined") {
      window.removeEventListener(event, handler);
    }
  }
}

export default RouterHelper;
