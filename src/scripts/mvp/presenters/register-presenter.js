import AuthModel from "../models/auth-model";
import { RouterHelper } from "../../utils";

class RegisterPresenter {
  constructor({ model, view }) {
    this._model = model || new AuthModel();
    this._view = view;
  }

  async init() {
    this._view.initElements();
    this._view.bindFormSubmit(this._handleRegister.bind(this));
  }

  async _handleRegister(name, email, password) {
    try {
      this._view.showNotification("Memproses pendaftaran...", "loading");

      const response = await this._model.register(name, email, password);

      if (response.error) {
        this._view.showNotification(response.message, "error");
        return;
      }

      // Success notification
      this._view.showNotification(
        "Pendaftaran berhasil! Silakan login.",
        "success"
      );

      // Redirect to login page after short delay
      setTimeout(() => {
        RouterHelper.navigate("#/login");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      this._view.showNotification(
        "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.",
        "error"
      );
    }
  }
}

export default RegisterPresenter;
