class AboutView {
  constructor() {
    this._aboutContainer = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <div class="about-page">
          <h1 class="page-title">Tentang Aplikasi</h1>
          
          <div class="about-content">
            <div class="app-intro">
              <div class="app-logo">
                <img src="./images/logo.png" alt="Dicoding Story App Logo">
              </div>
              <div class="app-description">
                <h2>Dicoding Story App</h2>
                <p>Bagikan cerita dan momen berharga Anda dengan Dicoding Story App!</p>
                <p>Aplikasi ini dibuat untuk submission Dicoding Belajar Pengembangan Aplikasi Web dengan React</p>
              </div>
            </div>
            
            <div class="features-section">
              <h3>Fitur Utama</h3>
              <ul class="features-list">
                <li>
                  <i class="fas fa-share-alt feature-icon"></i>
                  <div class="feature-info">
                    <h4>Berbagi Cerita</h4>
                    <p>Bagikan cerita dan pengalaman Anda dengan pengguna lain</p>
                  </div>
                </li>
                <li>
                  <i class="fas fa-image feature-icon"></i>
                  <div class="feature-info">
                    <h4>Unggah Foto</h4>
                    <p>Setiap cerita dapat dilengkapi dengan foto menarik</p>
                  </div>
                </li>
                <li>
                  <i class="fas fa-map-marker-alt feature-icon"></i>
                  <div class="feature-info">
                    <h4>Berbagi Lokasi</h4>
                    <p>Tambahkan lokasi pada cerita Anda dan lihat di peta</p>
                  </div>
                </li>
                <li>
                  <i class="fas fa-mobile-alt feature-icon"></i>
                  <div class="feature-info">
                    <h4>Progressive Web App</h4>
                    <p>Dapat digunakan secara offline dan diinstal di perangkat mobile</p>
                  </div>
                </li>
                <li>
                  <i class="fas fa-camera feature-icon"></i>
                  <div class="feature-info">
                    <h4>Kamera</h4>
                    <p>Ambil foto langsung dari kamera perangkat Anda</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="tech-section">
              <h3>Teknologi yang Digunakan</h3>
              <div class="tech-list">
                <div class="tech-item">
                  <i class="fab fa-js tech-icon"></i>
                  <span>JavaScript</span>
                </div>
                <div class="tech-item">
                  <i class="fab fa-html5 tech-icon"></i>
                  <span>HTML5</span>
                </div>
                <div class="tech-item">
                  <i class="fab fa-css3-alt tech-icon"></i>
                  <span>CSS3</span>
                </div>
                <div class="tech-item">
                  <i class="fas fa-box tech-icon"></i>
                  <span>Webpack</span>
                </div>
                <div class="tech-item">
                  <i class="fas fa-server tech-icon"></i>
                  <span>PWA</span>
                </div>
                <div class="tech-item">
                  <i class="fas fa-code tech-icon"></i>
                  <span>MVP</span>
                </div>
              </div>
            </div>
            
            <div class="developer-section">
              <h3>Pengembang</h3>
              <div class="developer-info">
                <div class="developer-photo">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="developer-bio">
                  <h4>Dikembangkan untuk Submission Dicoding</h4>
                  <p>Kelas Belajar Pengembangan Aplikasi Web Intermediate</p>
                  <div class="developer-links">
                    <a href="https://github.com/" target="_blank" rel="noopener">
                      <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://dicoding.com/" target="_blank" rel="noopener">
                      <i class="fas fa-globe"></i> Dicoding
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  initElements() {
    this._aboutContainer = document.querySelector(".about-page");

    // Tambahkan efek animasi saat scroll
    this._initScrollAnimations();

    return this;
  }

  _initScrollAnimations() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const elements = document.querySelectorAll(
      ".features-section, .tech-section, .developer-section, .features-list li, .tech-item"
    );
    elements.forEach((el) => {
      el.classList.add("animate-item");
      observer.observe(el);
    });

    // Tambahkan efek hover pada tech items
    const techItems = document.querySelectorAll(".tech-item");
    techItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const icon = item.querySelector(".tech-icon");
        icon.style.transform = "scale(1.2) rotate(5deg)";
        icon.style.transition = "transform 0.3s ease";
      });

      item.addEventListener("mouseleave", () => {
        const icon = item.querySelector(".tech-icon");
        icon.style.transform = "scale(1) rotate(0)";
      });
    });

    // Tambahkan efek pulsing pada logo
    const logo = document.querySelector(".app-logo img");
    if (logo) {
      setInterval(() => {
        logo.classList.add("pulse-animation");
        setTimeout(() => {
          logo.classList.remove("pulse-animation");
        }, 1000);
      }, 5000);
    }
  }
}

export default AboutView;
