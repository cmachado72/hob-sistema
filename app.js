const App = {
  state: {
    currentPage: 'upload',
    files:      { input01: null, input02: null, input03: null, input04: null },
    parsed:     { input01: null, input02: null, input03: null, input04: null },
    fileStatus: { input01: 'waiting', input02: 'waiting', input03: 'waiting', input04: 'waiting' },
    errors:     { input01: [], input02: [], input03: [], input04: [] },
    mesReferencia: null,
    processedData: null
  },

  pages: {
    upload:     UploadPage,
    validacao:  ValidacaoPage,
    historico:  HistoricoPage,
    templates:  TemplatesPage,
    parametros: ParametrosPage
  },

  navigate(page) {
    this.state.currentPage = page;
    this.render();
    this.updateNav();
    window.scrollTo(0, 0);
  },

  updateNav() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      const active = el.dataset.nav === this.state.currentPage;
      el.classList.toggle('active', active);
    });
  },

  render() {
    const main = document.getElementById('main-content');
    const page = this.pages[this.state.currentPage];
    if (!page) return;
    main.innerHTML = page.render();
    if (page.init) page.init();
  },

  fmt(n) {
    return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  init() {
    this.render();
    this.updateNav();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
