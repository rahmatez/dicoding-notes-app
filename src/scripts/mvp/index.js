// Models
import StoryModel from "./models/story-model";
import AuthModel from "./models/auth-model";

// Views
import HomeView from "./views/home-view";
import AboutView from "./views/about-view";
import DetailView from "./views/detail-view";
import CreateStoryView from "./views/create-story-view";
import MapView from "./views/map-view";
import LoginView from "./views/login-view";
import RegisterView from "./views/register-view";
import FavoritesView from "./views/favorites/favorites-view";

// Presenters
import HomePresenter from "./presenters/home-presenter";
import AboutPresenter from "./presenters/about-presenter";
import DetailPresenter from "./presenters/detail-presenter";
import CreateStoryPresenter from "./presenters/create-story-presenter";
import MapPresenter from "./presenters/map-presenter";
import LoginPresenter from "./presenters/login-presenter";
import RegisterPresenter from "./presenters/register-presenter";
import FavoritesPresenter from "./presenters/favorites-presenter";

// Create model instances for reuse
const storyModel = new StoryModel();
const authModel = new AuthModel();

// Export functions to initialize MVP components
export const initHomePageMVP = () => {
  const view = new HomeView();
  const presenter = new HomePresenter({
    view,
    model: storyModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      // Reset state to ensure fresh content
      if (window.location.hash === "#/" || window.location.hash === "") {
        storyModel.resetState();
      }
      await presenter.init();
    },
    onLeave: () => {
      // Handle cleanup if needed
      console.log("Leaving home page");
    },
  };
};

export const initAboutPageMVP = () => {
  const view = new AboutView();
  const presenter = new AboutPresenter({
    view,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      await presenter.init();
    },
  };
};

export const initDetailPageMVP = () => {
  const view = new DetailView();
  const presenter = new DetailPresenter({
    view,
    model: storyModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async (id) => {
      await presenter.init(id);
    },
    // Add cleanup method to be called when navigating away
    onLeave: () => {
      if (presenter && typeof presenter.destroy === "function") {
        presenter.destroy();
      }
    },
  };
};

export const initCreateStoryPageMVP = () => {
  const view = new CreateStoryView();
  const presenter = new CreateStoryPresenter({
    view,
    model: storyModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      await presenter.init();
    },
  };
};

export const initMapPageMVP = () => {
  const view = new MapView();
  const presenter = new MapPresenter({
    view,
    model: storyModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async (lat, lon) => {
      console.log("Map page afterRender with:", lat, lon);
      await presenter.init(lat, lon);
    },
    onLeave: () => {
      if (presenter && typeof presenter.destroy === "function") {
        presenter.destroy();
      }
    },
  };
};

export const initLoginPageMVP = () => {
  const view = new LoginView();
  const presenter = new LoginPresenter({
    view,
    model: authModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      await presenter.init();
    },
  };
};

export const initRegisterPageMVP = () => {
  const view = new RegisterView();
  const presenter = new RegisterPresenter({
    view,
    model: authModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      await presenter.init();
    },
  };
};

// Export model instances for reuse
export const initFavoritesPageMVP = () => {
  const view = new FavoritesView();
  const presenter = new FavoritesPresenter({
    view,
    model: storyModel,
  });

  return {
    view,
    presenter,
    render: () => view.getTemplate(),
    afterRender: async () => {
      await presenter.init();
    },
  };
};

export const models = {
  story: storyModel,
  auth: authModel,
};
