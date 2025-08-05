import StoryModel from "../../mvp/models/story-model";
import FavoritesView from "../../mvp/views/favorites/favorites-view";
import FavoritesPresenter from "../../mvp/presenters/favorites/favorites-presenter";

class FavoritesPage {
  async render() {
    const view = new FavoritesView();
    return view.getTemplate();
  }

  async afterRender() {
    const model = new StoryModel();
    const view = new FavoritesView();
    const presenter = new FavoritesPresenter({ model, view });

    await presenter.init();
  }
}

export default FavoritesPage;
