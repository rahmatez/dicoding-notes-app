Dalam mengerjakan proyek ini, ada beberapa kriteria yang perlu Anda penuhi. Kriteria-kriteria ini diperlukan agar Anda dapat lulus dari tugas ini.

Berikut adalah daftar kriteria utama yang harus Anda penuhi.

Kriteria Wajib 1: Memanfaatkan Satu API sebagai Sumber Data
Anda WAJIB mengambil satu API sebagai sumber datanya. Pemilihan ini juga akan menentukan topik aplikasi yang akan Anda kembangkan. Oleh karena itu, silakan manfaatkan API yang telah kami sediakan.

Story API Documentation
Kriteria Wajib 2: Menggunakan Arsitektur Single-Page Application
Aplikasi yang Anda buat harus mengadopsi arsitektur Single-Page Application (SPA) seperti yang kami contohkan pada proyek latihan. Berikut adalah ketentuan yang WAJIB diterapkan.

Menggunakan teknik hash (#) dalam menangani routing di browser.
Menerapkan pola model-view-presenter (MVP) dalam pengelolaan data ke user interface.
Kriteria Wajib 3: Menampilkan Data
Aplikasi memiliki halaman yang menampilkan data dari API. Berikut adalah beberapa ketentuan yang WAJIB diterapkan.

Data ditampilkan dalam bentuk daftar dan bersumber dari API pilihan Anda.
Pada setiap item daftarnya, tampilkan minimal satu data gambar dan tiga data teks.
Tambahkan peta digital untuk menunjukkan lokasi data.
Pastikan peta memiliki marker dan menampilkan popup saat diklik.
Hal yang perlu dicatat adalah SERTAKAN API key dari map service yang digunakan dalam STUDENT.txt jika memang aplikasi Anda membutuhkannya. Bila tidak memiliki berkas tersebut, silakan buat baru dalam root project, ya.

Kriteria Wajib 4: Memiliki Fitur Tambah Data Baru
Selain menampilkan data ke halaman, aplikasi WAJIB punya kemampuan menambahkan data baru ke API. Tentunya, ini berpotensi membutuhkan halaman baru untuk menampilkan formulir. Pastikan halaman tersebut berisi kolom-kolom input yang dibutuhkan untuk mendapatkan data dari user.

Meskipun masing-masing API memiliki kebutuhan yang berbeda, ada kemiripan data. Berikut adalah beberapa ketentuan WAJIBNYA.

Mengambil data gambar dengan kamera. Pastikan stream yang dibuat telah nonaktif jika tidak diperlukan lagi.
Gunakan peta digital dan event klik untuk mengambil data latitude dan longitude. Anda diperkenankan memanfaatkan library apa pun selain yang diajarkan di kelas.
Kriteria Wajib 5: Menerapkan Aksesibilitas sesuai dengan Standar
Ada beberapa aspek dalam meningkatkan aksesibilitas aplikasi. Perhatikan ketentuan-ketentuan WAJIBNYA.

Menerapkan skip to content.
Memiliki teks alternatif pada konten-konten gambar yang esensial.
Pastikan setiap form control, seperti <input>, berasosiasi dengan <label> agar mudah diakses.
Menggunakan semantic element dalam menyusun struktur halaman dan landmarking HTML.
Kriteria Wajib 6: Merancang Transisi Halaman yang Halus
Untuk pengalaman pengguna yang makin baik, aplikasi Anda WAJIB mengimplementasikan gaya transisi halaman secara halus menggunakan View Transition API.

Selain kriteria utama, ada kriteria opsional juga yang dapat Anda penuhi agar mendapat penilaian lebih tinggi.

Kriteria Opsional 1: Memiliki Tampilan yang Menarik
Anda dapat membangun aplikasi seciamik mungkin. Anda bebas berkreasi sekreatif apa pun. Berikut adalah daftar KRITERIA MINIMAL untuk tampilan menarik.

Memiliki pemilihan warna yang cocok dan pas. Anda dapat mengambil referensi dari colorhunt.co.
Memiliki tata letak elemen yang pas. Pastikan tidak ada konten yang bertumpuk.
Pemilihan gaya font yang mudah dibaca.
Penerapan padding dan margin yang pas.
Menampilkan gambar ikon untuk memperkaya caption, yaitu Font Awesome, Feather Icons, dsb.
Kriteria Opsional 2: Mobile Friendly
Aplikasi memiliki tampilan yang ramah untuk para pengguna perangkat kecil. Maknanya, aplikasi mudah diakses di semua perangkat. Ini termasuk pada ranah meningkatkan aksesibilitas.

Kriteria Opsional 3: Kustomisasi Transisi Halaman dengan Animation API
Untuk memberikan keunikan aplikasi, Anda bisa memanfaatkan Animation API dalam membuat kustomisasi transisi halaman.

Kriteria Opsional 4: Memiliki Beragam Gaya Peta dalam Layer Control
Dalam meningkatkan pengalaman user, Anda direkomendasikan menerapkan layer control dan dua atau lebih tile layer. Anda bisa memanfaatkan map service apa pun, misalnya MapTiler, dan pastikan gunakan plugin tambahan jika memanfaatkan leaflet dan vector tile.

Submission Anda akan dinilai oleh Reviewer dengan penilaian bintang berskala 1–5. Penilaian ini diukur berdasarkan parameter yang akan dijelaskan. Anda dapat menerapkan beberapa saran untuk mendapatkan nilai tinggi. Berikut daftarnya.

Menerapkan kriteria opsional pertama: memiliki tampilan yang menarik.
Menerapkan kriteria opsional kedua: mobile friendly.
Menerapkan kriteria opsional ketiga: kustomisasi transisi halaman dengan Animation API.
Menerapkan kriteria opsional keempat: memiliki banyak gaya peta dalam layer control.

Ketika Anda menerapkan arsitektur MVP, penting untuk memastikan kembali setiap komponen baik itu model, view, dan presenter bertindak sesuai dengan tanggung jawabnya masing-masing. Mari kita reviu kembali seperti apa pembagian tanggung jawabnya.

Model
Bertanggung jawab sepenuhnya atas pengelolaan data dalam aplikasi, seperti: mengambil data dari server melalui HTTP request atau menyimpan data pada sebuah lokasi seperti local storage.

View
Bertanggung jawab sepenuhnya atas tampilan aplikasi yang disajikan ke pengguna. Contoh, kode DOM Manipulation untuk menampilkan loading, menampilkan fallback error, dan menampilkan sebuah data.

Presenter
Merupakan penghubung antara model dan view. Bertanggung jawab untuk mengatur logika presentasi, contoh menggunakan model untuk mendapatkan data dari API kemudian mengirimkan data tersebut ke view melalui sebuah fungsi.

Mari kita ambil contoh dua kasus umum dalam membuat aplikasi, yaitu menampilkan data dari API dan login.

Contoh untuk menampilkan data dari API. Fungsi yang ada di model bertugas untuk mendapatkan data dari API, di mana kode fetch berada di dalam fungsi ini.

model.js
export class RestaurantModel {
async getRestaurants() {
const response = await fetch('https://restaurant-api.dicoding.dev/list');

    if (!response.ok) {
      throw new Error('RESTAURANT_FAILED_TO_GET');
    }


    const { restaurants } = await response.json();


    return restaurants;

}
}
Lalu pada view, kita tulis segala kode yang berhubungan dengan DOM Manipulation. Selain itu, view juga menjadi lokasi di mana kita membuat instance dari model dan presenter (contoh kode akan diperlihatkan nanti).

view.js
import { RestaurantsModel } from './model.js';
import { RestaurantsPagePresenter } from './presenter.js';

export class RestaurantsPageView {
render() {
// ... melakukan rendering awal
}

async afterRender() {
// ... membuat model dan presenter
const model = new RestaurantsModel();
const presenter = new RestaurantsPagePresenter(model, this);

    // ... memanggil `getRestaurants()` dari presenter.
    await presenter.getRestaurants();

}

renderRestaurants(restaurants) {
const container = document.getElementById('container');
const restaurantNamesAsParagraph = restaurants.map((restaurant) => {
const pElement = document.createElement('p');
pElement.innerText = restaurant.name;
return pElement;
});

    // rendering restaurants
    container.innerHTML = ''; // clearing container
    restaurantNamesAsParagraph.forEach((pElement) => {
      container.appendChild(pElement);
    });

}

renderFailedMessage() {
const container = document.getElementById('container');
container.innerHTML = ''; // clearing container
container.innerText = 'Gagal mendapatkan data restaurant';
}

showLoading() {
const container = document.getElementById('container');
container.innerText = 'Loading to get restaurant ...';
}
}
Perlu Anda perhatikan bahwa di view, kami membuat banyak fungsi untuk melakukan DOM Manipulation. Fungsi-fungsi tersebut nantinya akan digunakan oleh presenter yang bertugas untuk mengomposisikan atau menghubungkan logika antara view dan model.

Berikut adalah kode di dalam presenter.

presenter.js
export class RestaurantsPagePresenter {
constructor(model, view) {
this.model = model;
this.view = view;
}

async getRestaurants() {
try {
this.view.showLoading();
const restaurants = await this.model.getRestaurants();
this.view.renderRestaurants(restaurants);
} catch {
this.view.renderFailedMessage();
}
}
}
Presenter bertindak sebagai penghubung antara Model dan View di arsitektur MVP. Presenter bertanggung jawab mengatur alur data dan logika tampilan. Presenter juga dapat melakukan formatting atau transformasi data sebelum dikirim ke View agar sesuai kebutuhan tampilan. Dengan begitu, Presenter memastikan View hanya fokus pada rendering UI dan Model hanya fokus pada pengelolaan data, sementara Presenter mengeksekusi logika bisnis dan sinkronisasi keduanya.

Berikut contoh implementasi MVP untuk proses login pengguna. File-file yang digunakan adalah model.js, view.js, dan presenter.js:

model.js
export class LoginModel {
async login(username, password) {
const response = await fetch('https://example.com/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ username, password }),
});

    if (!response.ok) {
      throw new Error('LOGIN_FAILED');
    }


    const user = await response.json();
    return user;

}
}
view.js
import { LoginModel } from './model.js';
import { LoginPagePresenter } from './presenter.js';

export class LoginPageView {
render() {
const container = document.getElementById('container');
container.innerHTML = `      <input id="usernameInput" placeholder="Username" />
      <input id="passwordInput" type="password" placeholder="Password" />
      <button id="loginButton">Login</button>
   `;
}

async afterRender() {
const model = new LoginModel();
const presenter = new LoginPagePresenter(model, this);
const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', async () => {
const username = document.getElementById('usernameInput').value;
const password = document.getElementById('passwordInput').value;
await presenter.loginUser(username, password);
});
}

showLoading() {
const container = document.getElementById('container');
container.innerText = 'Memproses login...';
}

renderLoginSuccess(user) {
const container = document.getElementById('container');
container.innerText = `Selamat datang, ${user.name}!`;
}

renderLoginError() {
const container = document.getElementById('container');
container.innerText = 'Login gagal. Cek kembali username dan password.';
}
}
model.js
export class LoginPagePresenter {
constructor(model, view) {
this.model = model;
this.view = view;
}

async loginUser(username, password) {
try {
this.view.showLoading();
const user = await this.model.login(username, password);
this.view.renderLoginSuccess(user);
} catch (error) {
this.view.renderLoginError();
}
}
}

Jangan Lakukan DOM Manipulation di dalam Presenter
Contoh salah (anti-pattern)
// Presenter melakukan DOM manipulation langsung (salah)
export class WrongPresenter {
showData() {
const data = await model.getData();
const container = document.getElementById('container');
container.innerHTML = `<p>${data}</p>`;
}
}
Contoh benar
// Presenter hanya memanggil metode View untuk update UI
export class CorrectPresenter {
showData() {
const data = await model.getData();
this.view.renderData(data);
}
}
Pada contoh yang benar, Presenter tidak langsung mengakses DOM. Presenter cukup memanggil metode di View (renderData) untuk mengupdate UI. Dengan begitu, logika manipulasi DOM tetap berada di dalam View, sesuai prinsip pemisahan tanggung jawab pada arsitektur MVP.

Jangan Lakukan pemanggilan Fetch atau Local Storage di View
Contoh salah (anti-pattern)
export class LoginPageView {
async afterRender() {
// View melakukan fetch langsung (salah)
const response = await fetch('https://example.com/data');
const data = await response.json();
this.showData(data);
}
}
Contoh benar
// Presenter dan Model yang menangani pengambilan data
export class LoginPageView {
async afterRender() {
const model = new DataModel();
const presenter = new DataPresenter(model, this);
await presenter.loadData();
}
}
Pada contoh yang benar, View tidak melakukan fetch atau akses storage langsung. View hanya memanggil Presenter untuk memuat data (presenter.loadData()), sementara Presenter akan menggunakan Model untuk mengambil data dari server atau local storage. Dengan ini, View tetap fokus pada tampilan dan tidak terikat pada logika pengambilan data.

Jangan Lakukan Pemanggilan Fetch Langsung di Presenter
Contoh salah (anti-pattern)
export class RestaurantsPagePresenter {
async getRestaurants() {
try {
this.view.showLoading();

      // Presenter melakukan fetch langsung (SALAH)
      const response = await fetch('https://restaurant-api.dicoding.dev/list');
      const { restaurants } = await response.json();

      this.view.renderRestaurants(restaurants);
    } catch {
      this.view.renderFailedMessage();
    }

}
}
Pada contoh di atas, Presenter melanggar prinsip MVP karena mengambil alih tanggung jawab Model. Presenter langsung melakukan fetch, padahal seharusnya Model yang bertugas mengelola proses pengambilan data. Ini membuat Presenter jadi terlalu kompleks dan mengandung logika data yang bukan tanggung jawabnya.

Contoh yang Benar:

presenter.js
export class RestaurantsPagePresenter {
constructor(model, view) {
this.model = model;
this.view = view;
}

async getRestaurants() {
try {
this.view.showLoading();
const restaurants = await this.model.getRestaurants(); // gunakan model
this.view.renderRestaurants(restaurants);
} catch {
this.view.renderFailedMessage();
}
}
}
model.js
export class RestaurantsModel {
async getRestaurants() {
const response = await fetch('https://restaurant-api.dicoding.dev/list');

    if (!response.ok) {
      throw new Error('RESTAURANT_FAILED_TO_GET');
    }

    const { restaurants } = await response.json();
    return restaurants;

}
}
Pada contoh yang benar, fetch hanya dilakukan di dalam Model. Presenter cukup memanggil fungsi model.getRestaurants() dan tidak perlu tahu detail teknis dari API. Dengan cara ini, kode menjadi lebih modular, mudah diuji, dan mengikuti prinsip tanggung jawab tunggal di arsitektur MVP.

Jangan Langsung Gunakan Model di Dalam View
Contoh salah (anti-pattern)
export class View {
async afterRender() {
// View langsung menggunakan Model (salah)
const model = new SomeModel();
const items = await model.getItems();
this.showItems(items);
}
}
Contoh benar:
// Presenter yang menghubungkan Model dan View
export class View {
async afterRender() {
const model = new SomeModel();
const presenter = new SomePresenter(model, this);
await presenter.loadItems();
}
}
Pada contoh benar, View tidak langsung memanggil fungsi Model. Sebaliknya, View membuat instance Presenter (dengan Model) dan memerintahkan Presenter untuk memuat data (presenter.loadItems()). Presenter kemudian akan menggunakan Model untuk mengambil data dan mengembalikannya ke View. Pendekatan ini menjaga agar View tetap terpisah dari logika pengelolaan data Model.

Pertanyaan Umum Seputar MVP
Q: Di mana kita membuat instance dari presenter?
Biasanya instance Presenter dibuat di dalam View saat initialization atau setelah tampilan awal selesai di-render (misalnya di method afterRender). Dengan cara ini, View memiliki akses ke Presenter dan Model-nya. Contoh:

export class SomeView {
async afterRender() {
const model = new SomeModel();
const presenter = new SomePresenter(model, this);
// Sekarang presenter siap digunakan
}
}
Pada contoh di atas, View membuat Model dan Presenter, kemudian menyimpan Presenter untuk digunakan lebih lanjut, misalnya memanggil fungsi Presenter saat ada event di UI.

Q: Kapan fungsi dalam presenter di panggil?
Fungsi di dalam Presenter biasanya dipanggil oleh View ketika dibutuhkan, baik saat inisialisasi halaman maupun saat terjadi event interaksi pengguna. Misalnya, pada method afterRender, View dapat memanggil presenter.getRestaurants() untuk langsung mengambil data setelah halaman dimuat. Contoh alur:

export class MyView {
async afterRender() {
const model = new MyModel();
const presenter = new MyPresenter(model, this);
// Memanggil fungsi presenter setelah render awal
await presenter.loadData();
}
}
Selain itu, fungsi Presenter juga bisa dipanggil di event handler View, misalnya saat pengguna klik tombol:

document.getElementById('someButton').addEventListener('click', () => {
presenter.someAction();
});
Dengan demikian, Presenter akan dijalankan saat View membutuhkan suatu aksi (misalnya mengambil data atau merespon input pengguna) sesuai alur aplikasi.

Q: Bolehkah memiliki lebih dari 1 presenter dalam 1 view?
Tidak ada larangan memiliki lebih dari satu Presenter di satu halaman atau view. Bahkan, hal ini umum terjadi jika satu halaman memiliki beberapa fitur atau komponen berbeda yang membutuhkan logika terpisah. Misalnya, sebuah halaman dapat memiliki satu Presenter untuk mengelola data profil pengguna dan Presenter lain untuk daftar produk. Contoh penggunaan dua presenter:

// Presenter untuk profil pengguna
const profileModel = new ProfileModel();
const profilePresenter = new ProfilePresenter(profileModel, this);

// Presenter untuk daftar item
const itemsModel = new ItemsModel();
const itemsPresenter = new ItemsPresenter(itemsModel, this);
Kedua Presenter di atas berfungsi secara independen sesuai bagian tugasnya masing-masing. Memiliki beberapa Presenter berguna untuk memisahkan tanggung jawab logika tiap fitur, sehingga kode lebih terorganisasi dan mudah dikelola.
