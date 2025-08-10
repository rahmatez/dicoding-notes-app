import AuthModel from "../models/auth-model";
import { RouterHelper } from "../../utils";

class LoginPresenter {
  constructor({ model, view }) {
    this._model = model || new AuthModel();
    this._view = view;
  }

  async init() {
    this._view.initElements();
    this._view.bindFormSubmit(this._handleLogin.bind(this));
  }

  async _handleLogin(email, password) {
    try {
      this._view.showNotification("Memproses login...", "loading");

      const response = await this._model.login(email, password);

      if (response.error) {
        this._view.showNotification(response.message, "error");
        return;
      }

      // Set a flag to force refresh home page after login
      sessionStorage.setItem("forceHomeRefresh", "true");

      // Success notification
      this._view.showNotification("Login berhasil! Mengalihkan...", "success");

      // Update navigation UI immediately after successful login
      if (typeof window.updateNavigationUI === "function") {
        window.updateNavigationUI();
      }

      // Redirect to home page after short delay
      setTimeout(() => {
        RouterHelper.navigate("#/");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      this._view.showNotification(
        "Terjadi kesalahan saat login. Silakan coba lagi.",
        "error"
      );
    }
  }
}

export default LoginPresenter;
