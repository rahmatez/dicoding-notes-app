import { login } from "../../data/api";
import { saveToken, saveUser, checkAuth } from "../../utils";

class LoginPage {
  constructor() {
    this._formElement = null;
    this._notificationElement = null;
  }

  async render() {
    // Redirect ke home jika sudah login
    if (checkAuth()) {
      window.location.hash = "#/";
      return "";
    }

    return `
      <section class="container">
        <div class="auth-container">
          <h1 class="auth-title">Masuk</h1>

          <div id="notification" class="alert hidden"></div>

          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                required
                placeholder="Masukkan email Anda"
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control" 
                required
                placeholder="Masukkan password Anda"
                minlength="8"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn">
                <i class="fas fa-sign-in-alt"></i> Masuk
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p>Belum punya akun? <a href="#/register">Daftar sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Redirect ke home jika sudah login
    if (checkAuth()) return;

    this._formElement = document.getElementById("login-form");
    this._notificationElement = document.getElementById("notification");

    this._formElement.addEventListener("submit", (event) =>
      this._handleLogin(event)
    );
  }

  async _handleLogin(event) {
    event.preventDefault();

    const emailValue = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    try {
      this._showNotification("Sedang memproses...", "info");

      const response = await login(emailValue, passwordValue);

      if (!response.error) {
        const { token, userId, name } = response.loginResult;

        // Simpan token dan data user
        saveToken(token);
        saveUser({ id: userId, name });

        this._showNotification("Berhasil masuk!", "success");

        // Redirect ke halaman utama setelah 1 detik dan force refresh
        setTimeout(() => {
          // Use replaceState to clear the cached home page content before redirecting
          window.sessionStorage.setItem("forceHomeRefresh", "true");
          window.location.hash = "#/";
        }, 1000);
      } else {
        this._showNotification(
          response.message || "Gagal masuk. Periksa kembali email dan password",
          "error"
        );
      }
    } catch (error) {
      this._showNotification(
        error.message || "Terjadi kesalahan. Silakan coba lagi",
        "error"
      );
    }
  }

  _showNotification(message, type = "info") {
    this._notificationElement.textContent = message;
    this._notificationElement.className = `alert alert-${type}`;
    this._notificationElement.classList.remove("hidden");

    if (type !== "loading") {
      setTimeout(() => {
        this._notificationElement.classList.add("hidden");
      }, 5000);
    }
  }
}

export default LoginPage;
