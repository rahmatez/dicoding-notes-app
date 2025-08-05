class RegisterView {
  constructor() {
    this._formElement = null;
    this._notificationElement = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="auth-container">
          <h1 class="auth-title">Daftar Akun</h1>

          <div id="notification" class="alert hidden"></div>

          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name" class="form-label">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control" 
                required
                placeholder="Masukkan nama Anda"
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
                placeholder="Masukkan password (min. 8 karakter)"
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
            <p>Sudah punya akun? <a href="#/login">Login disini</a></p>
          </div>
        </div>
      </section>
    `;
  }

  initElements() {
    this._formElement = document.getElementById("register-form");
    this._notificationElement = document.getElementById("notification");
    return this;
  }

  bindFormSubmit(handler) {
    this._formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameValue = document.getElementById("name").value;
      const emailValue = document.getElementById("email").value;
      const passwordValue = document.getElementById("password").value;

      handler(nameValue, emailValue, passwordValue);
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

export default RegisterView;
