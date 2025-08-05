// Import untuk MVP pattern (Model-View-Presenter)
// Pendekatan MVP memisahkan kode menjadi 3 bagian:
// - Model: Menangani data dan logika bisnis
// - View: Menangani tampilan dan UI
// - Presenter: Penghubung antara Model dan View
import {
  initHomePageMVP,
  initAboutPageMVP,
  initDetailPageMVP,
  initCreateStoryPageMVP,
  initMapPageMVP,
  initLoginPageMVP,
  initRegisterPageMVP,
  initFavoritesPageMVP,
} from "../mvp/index";

// Import NotFoundPage
import NotFoundPage from "../pages/notfound/not-found-page";

// Initialize MVP for all pages
const homeMVP = initHomePageMVP();
const aboutMVP = initAboutPageMVP();
const detailMVP = initDetailPageMVP();
const createStoryMVP = initCreateStoryPageMVP();
const mapMVP = initMapPageMVP();
const loginMVP = initLoginPageMVP();
const registerMVP = initRegisterPageMVP();
const favoritesMVP = initFavoritesPageMVP();

// Initialize NotFoundPage (using direct page object as it doesn't need MVP)
const notFoundPage = new NotFoundPage();

const routes = {
  "/": homeMVP,
  "/about": aboutMVP,
  "/detail/:id": detailMVP,
  "/create": createStoryMVP,
  "/map": mapMVP,
  "/maps/:lat/:lon": mapMVP, // For direct location viewing
  "/login": loginMVP,
  "/register": registerMVP,
  "/favorites": favoritesMVP,
};

// Not found route
const notFoundRoute = {
  render: () => notFoundPage.render(),
  afterRender: () => notFoundPage.afterRender(),
};

export { notFoundRoute };
export default routes;
