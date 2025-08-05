class AboutPresenter {
  constructor({ view }) {
    this._view = view;
  }

  async init() {
    this._view.initElements();
  }
}

export default AboutPresenter;
