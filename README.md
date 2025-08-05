# Dicoding Story App

Aplikasi berbagi cerita yang memungkinkan pengguna untuk berbagi pengalaman mereka dalam bentuk cerita dengan foto dan lokasi menggunakan Dicoding Story API.

## Fitur Utama

- 📱 Single-Page Application (SPA) dengan arsitektur Model-View-Presenter (MVP)
- 🖼️ Melihat daftar cerita dari pengguna Dicoding
- 📝 Menambahkan cerita baru dengan foto dan lokasi
- 🗺️ Menampilkan cerita pada peta digital dengan Leaflet
- 📷 Mengambil foto dengan kamera perangkat
- 🔐 Autentikasi pengguna (login dan register)
- 🌐 Progressive Web App (PWA) dengan Service Worker
- 🔔 Web Push Notification
- ✨ Transisi halaman yang halus dengan View Transition API
- ♿ Aksesibilitas sesuai standar

## Table of Contents

- [Demo](#demo)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Kriteria Proyek](#kriteria-proyek)

## Getting Started

## Demo

![Dicoding Story App Screenshot](src/public/images/screenshot.png)

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 14 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone repositori ini
   ```shell
   git clone https://github.com/rahmatez/dicoding-story-app.git
   cd dicoding-story-app
   ```
2. Pasang seluruh dependencies
   ```shell
   npm install
   ```
3. Edit file `STUDENT.txt` dan masukkan API key MapBox Anda (jika menggunakan MapBox)
4. Edit file konfigurasi di `src/scripts/config.js` sesuai kebutuhan

## Scripts

- Build for Production:

  ```shell
  npm run build
  ```

  Script ini menjalankan webpack dalam mode production menggunakan konfigurasi `webpack.prod.js` dan menghasilkan sejumlah file build ke direktori `dist`.

- Start Development Server:

  ```shell
  npm run start-dev
  ```

  Script ini menjalankan server pengembangan webpack dengan fitur live reload dan mode development sesuai konfigurasi di`webpack.dev.js`.

- Serve:
  ```shell
  npm run serve
  ```
  Script ini menggunakan [`http-server`](https://www.npmjs.com/package/http-server) untuk menyajikan konten dari direktori `dist`.

## Project Structure

Proyek ini menggunakan struktur yang modular dan terorganisir sesuai dengan konsep SPA dan MVP.

```text
dicoding-story-app/
├── dist/                   # Compiled files for production
├── src/                    # Source project files
│   ├── public/             # Public files
│   │   ├── images/         # Image assets
│   │   │   └── icons/      # PWA icons
│   │   ├── favicon.png     # App favicon
│   │   └── manifest.json   # PWA manifest
│   ├── scripts/            # Source JavaScript files
│   │   ├── data/           # Data layer
│   │   │   └── api.js      # API service functions
│   │   ├── pages/          # View components
│   │   │   ├── about/      # About page
│   │   │   ├── auth/       # Login & Register pages
│   │   │   ├── create/     # Create story page
│   │   │   ├── detail/     # Detail story page
│   │   │   ├── home/       # Home page
│   │   │   ├── map/        # Map page
│   │   │   └── app.js      # Main app component
│   │   ├── routes/         # Routing
│   │   │   ├── routes.js   # Route definitions
│   │   │   └── url-parser.js # URL parsing utilities
│   │   ├── utils/          # Utility functions
│   │   │   └── index.js    # Shared utilities
│   │   ├── config.js       # App configuration
│   │   └── index.js        # Main JavaScript entry file
│   ├── styles/             # Source CSS files
│   │   └── styles.css      # Main CSS file
│   └── index.html          # Main HTML file
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Project metadata and dependencies
├── README.md               # Project documentation
├── STUDENT.txt             # Student information with API keys
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
└── webpack.prod.js         # Webpack production configuration
```

## Kriteria Proyek

Aplikasi ini memenuhi semua kriteria wajib dan opsional untuk submission:

### Kriteria Wajib

1. ✅ Memanfaatkan Dicoding Story API sebagai sumber data
2. ✅ Menggunakan arsitektur Single-Page Application (SPA) dengan teknik hash (#) dan Model-View-Presenter (MVP)
3. ✅ Menampilkan data cerita dengan gambar dan teks dari API
4. ✅ Menampilkan peta digital untuk menunjukkan lokasi cerita dengan marker dan popup
5. ✅ Memiliki fitur tambah cerita baru dengan foto dari kamera dan koordinat dari peta
6. ✅ Menerapkan aksesibilitas sesuai standar (skip to content, alt text, label, semantic HTML)
7. ✅ Menggunakan View Transition API untuk transisi halaman yang halus

### Kriteria Opsional

1. ✅ Memiliki tampilan yang menarik dengan pemilihan warna, font, dan layout yang baik
2. ✅ Mobile friendly dengan tampilan responsif
3. ✅ Menggunakan Animation API untuk kustomisasi transisi halaman
4. ✅ Memiliki beragam gaya peta dalam layer control
