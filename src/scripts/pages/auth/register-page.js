import { register } from "../../data/api";
import { checkAuth } from "../../utils";

class RegisterPage {
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
          <h1 class="auth-title">Daftar Akun Baru</h1>

          <div id="notification" class="alert hidden"></div>

          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name" class="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control" 
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                required
                placeholder="Masukkan email valid"
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
                placeholder="Minimal 8 karakter"
                minlength="8"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn">
                <i class="fas fa-user-plus"></i> Daftar
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p>Sudah punya akun? <a href="#/login">Masuk sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Redirect ke home jika sudah login
    if (checkAuth()) return;

    this._formElement = document.getElementById("register-form");
    this._notificationElement = document.getElementById("notification");

    this._formElement.addEventListener("submit", (event) =>
      this._handleRegister(event)
    );
  }

  async _handleRegister(event) {
    event.preventDefault();

    const nameValue = document.getElementById("name").value;
    const emailValue = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    // Validasi sederhana
    if (passwordValue.length < 8) {
      this._showNotification("Password harus minimal 8 karakter", "error");
      return;
    }

    try {
      this._showNotification("Sedang mendaftarkan akun...", "info");

      const response = await register(nameValue, emailValue, passwordValue);

      if (!response.error) {
        this._showNotification(
          "Pendaftaran berhasil! Silahkan masuk dengan akun Anda.",
          "success"
        );

        // Reset form setelah berhasil
        this._formElement.reset();

        // Redirect ke halaman login setelah 2 detik
        setTimeout(() => {
          window.location.hash = "#/login";
        }, 2000);
      } else {
        this._showNotification(
          response.message || "Gagal mendaftar. Silakan coba lagi",
          "error"
        );
      }
    } catch (error) {
      if (error.message && error.message.includes("email")) {
        this._showNotification(
          "Email sudah digunakan. Gunakan email lain atau login.",
          "error"
        );
      } else {
        this._showNotification(
          error.message || "Terjadi kesalahan. Silakan coba lagi",
          "error"
        );
      }
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

export default RegisterPage;
