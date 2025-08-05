class NotFoundPage {
  constructor() {
    this._container = null;
  }

  async render() {
    return `
      <section class="container not-found-page">
        <div class="not-found-container">
          <div class="not-found-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h1 class="not-found-title">404 - Halaman Tidak Ditemukan</h1>
          <p class="not-found-description">
            Maaf, halaman yang Anda cari tidak ditemukan. Alamat yang Anda tuju
            mungkin salah atau halaman tersebut telah dipindahkan.
          </p>
          <div class="not-found-actions">
            <a href="#/" class="btn btn-primary">
              <i class="fas fa-home"></i> Kembali ke Beranda
            </a>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add animation effect to the not found page
    const notFoundContainer = document.querySelector(".not-found-container");
    setTimeout(() => {
      notFoundContainer.classList.add("fade-in");
    }, 100);
  }
}

export default NotFoundPage;
