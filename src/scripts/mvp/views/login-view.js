import { checkAuth } from "../../utils";

class LoginView {
  constructor() {
    this._formElement = null;
    this._notificationElement = null;
  }

  getTemplate() {
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

  initElements() {
    this._formElement = document.getElementById("login-form");
    this._notificationElement = document.getElementById("notification");
    return this;
  }

  bindFormSubmit(handler) {
    this._formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailValue = document.getElementById("email").value;
      const passwordValue = document.getElementById("password").value;

      handler(emailValue, passwordValue);
    });
  }

  showNotification(message, type = "info") {
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

export default LoginView;
