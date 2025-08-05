import { login, register } from "../../data/api";
import { saveToken, saveUser } from "../../utils";

class AuthModel {
  constructor() {
    this._currentUser = null;
    this._isLoggedIn = false;
    this._token = null;
  }

  async login(email, password) {
    try {
      const response = await login(email, password);

      if (!response.error) {
        const { token, userId, name } = response.loginResult;

        // Simpan token dan data user
        saveToken(token);
        saveUser({ id: userId, name });

        this._token = token;
        this._currentUser = { id: userId, name };
        this._isLoggedIn = true;

        return {
          success: true,
          data: {
            user: { id: userId, name },
            token,
          },
          message: "Login berhasil",
        };
      } else {
        return {
          success: false,
          message:
            response.message ||
            "Gagal masuk. Periksa kembali email dan password",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login",
      };
    }
  }

  async register(name, email, password) {
    try {
      const response = await register(name, email, password);

      if (!response.error) {
        return {
          success: true,
          message: "Registrasi berhasil",
        };
      } else {
        return {
          success: false,
          message: response.message || "Gagal melakukan registrasi",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat registrasi",
      };
    }
  }
}

export default AuthModel;
