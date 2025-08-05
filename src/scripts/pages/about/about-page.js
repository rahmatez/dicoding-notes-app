export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <div class="about-page">
          <h1>Tentang Dicoding Story App</h1>
          
          <div class="about-content">
            <div class="about-section">
              <h2>Tentang Aplikasi</h2>
              <p>Dicoding Story App adalah aplikasi berbagi cerita yang memungkinkan pengguna untuk berbagi pengalaman mereka dalam bentuk cerita dengan foto dan lokasi. Aplikasi ini dibuat sebagai proyek submission untuk kelas Belajar Pengembangan Web Intermediate di Dicoding.</p>
            </div>

            <div class="about-section">
              <h2>Fitur Utama</h2>
              <ul>
                <li>Lihat cerita dari pengguna lain</li>
                <li>Bagikan cerita Anda dengan foto dan lokasi</li>
                <li>Jelajahi cerita berdasarkan lokasi di peta</li>
                <li>Ambil foto langsung menggunakan kamera perangkat</li>
              </ul>
            </div>

            <div class="about-section">
              <h2>Teknologi yang Digunakan</h2>
              <ul>
                <li>HTML, CSS, dan JavaScript</li>
                <li>Single-Page Application (SPA) dengan arsitektur MVP</li>
                <li>Leaflet untuk peta interaktif</li>
                <li>Dicoding Story API</li>
                <li>Progressive Web App (PWA)</li>
                <li>Webpack untuk bundling</li>
                <li>View Transition API untuk transisi halaman yang halus</li>
              </ul>
            </div>

            <div class="about-section">
              <h2>Kontak Pengembang</h2>
              <p>Jika ada pertanyaan atau saran, silakan hubungi:</p>
              <p><i class="fas fa-envelope"></i> Email: <a href="mailto:rahmatezdev@gmail.com">rahmatezdev@gmail.com</a></p>
              <p><i class="fab fa-github"></i> GitHub: <a href="https://github.com/rahmatez" target="_blank">github.com/rahmatez</a></p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Kode tambahan bisa ditambahkan di sini jika diperlukan
  }
}
