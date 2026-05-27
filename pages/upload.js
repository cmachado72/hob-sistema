const UploadPage = {
  inputs: [
    { key: 'input01', num: '01', label: 'Remuneração Fixa', area: 'Kapital Humano',
      desc: 'Pró-labore bruto de Associados e Sócios', icon: '💰' },
    { key: 'input02', num: '02', label: 'Organograma',       area: 'Kapital Humano',
      desc: 'Base completa de pessoas ativas e inativas', icon: '🏢' },
    { key: 'input03', num: '03', label: 'Descontos e Benefícios', area: 'Área de Benefícios',
      desc: 'Descontos de plano de saúde, dental, VR/VT etc.', icon: '🏥' },
    { key: 'input04', num: '04', label: 'Arquivo de Folha (DP)', area: 'Depto. Pessoal',
      desc: 'Folha exportada após envio ao banco — todos os vínculos', icon: '📑' }
  ],

  render() {
    const s = App.state;
    const allLoaded = this.inputs.every(i => s.fileStatus[i.key] === 'loaded');
    const anyLoading = this.inputs.some(i => s.fileStatus[i.key] === 'loading');

    let cards = '';
    this.inputs.forEach(inp => {
      const status  = s.fileStatus[inp.key];
      const errors  = s.errors[inp.key] || [];
      const parsed  = s.parsed[inp.key];
      const count   = parsed && parsed.data ? parsed.data.length : 0;

      const borderCls = {
        waiting: 'border-slate-200',
        loading: 'border-blue-300',
        loaded:  'border-green-400',
        error:   'border-red-400'
      }[status] || 'border-slate-200';

      const bgCls = {
        waiting: 'bg-white',
        loading: 'bg-blue-50',
        loaded:  'bg-green-50',
        error:   'bg-red-50'
      }[status] || 'bg-white';

      const badge = {
        waiting: '<span class="status-badge bg-slate-100 text-slate-500">Aguardando</span>',
        loading: '<span class="status-badge bg-blue-100 text-blue-700">Carregando…</span>',
        loaded:  `<span class="status-badge bg-green-100 text-green-700">✓ ${count} registro${count !== 1 ? 's' : ''}</span>`,
        error:   `<span class="status-badge bg-red-100 text-red-700">✗ ${errors.length} erro${errors.length !== 1 ? 's' : ''}</span>`
      }[status] || '';

      const errHtml = errors.length ? `
        <div class="mt-2 ml-10 space-y-1 max-h-28 overflow-y-auto">
          ${errors.slice(0, 8).map(e => `<div class="text-xs text-red-600 flex gap-1.5 leading-tight"><span class="shrink-0">›</span><span>${e}</span></div>`).join('')}
          ${errors.length > 8 ? `<div class="text-xs text-red-400 italic">… e mais ${errors.length - 8} erro(s)</div>` : ''}
        </div>` : '';

      cards += `
        <div class="rounded-xl border-2 ${borderCls} ${bgCls} p-4 transition-all duration-200">
          <div class="flex items-start gap-3">
            <div class="text-2xl mt-0.5 shrink-0">${inp.icon}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-800 text-sm">INPUT ${inp.num} — ${inp.label}</span>
                <span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">${inp.area}</span>
                ${badge}
              </div>
              <p class="text-xs text-gray-400 mt-0.5">${inp.desc}</p>
              ${errHtml}
            </div>
            <label for="file-${inp.key}"
              class="shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Selecionar
            </label>
            <input type="file" id="file-${inp.key}" accept=".xlsx,.xls" class="hidden" data-key="${inp.key}">
          </div>
          <div id="drop-${inp.key}" data-key="${inp.key}"
            class="drop-zone mt-3 rounded-lg p-2.5 text-center text-xs text-slate-400 cursor-pointer ${status === 'loaded' ? 'loaded' : status === 'error' ? 'has-error' : ''}">
            Arraste o arquivo .xlsx aqui
          </div>
        </div>`;
    });

    const mesTag = s.mesReferencia
      ? `<div class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium mb-5">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
           Mês detectado: <strong>${s.mesReferencia}</strong>
         </div>`
      : '';

    const btnCls = allLoaded
      ? 'bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white cursor-pointer shadow-md'
      : 'bg-slate-200 text-slate-400 cursor-not-allowed';

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Upload de Inputs</h1>
          <p class="text-sm text-gray-500 mt-1">Carregue os 4 arquivos do mês de referência para iniciar o processamento.</p>
        </div>
        ${mesTag}
        <div class="space-y-3 mb-6">${cards}</div>
        <div class="flex items-center gap-4 pt-2 border-t border-slate-200">
          <button id="btn-processar" ${allLoaded && !anyLoading ? '' : 'disabled'}
            class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${btnCls}">
            Processar mês →
          </button>
          ${!allLoaded ? '<span class="text-sm text-slate-400">Aguardando todos os 4 arquivos sem erros</span>' : ''}
          ${allLoaded ? '<span class="text-sm text-green-600 font-medium">✓ Todos os arquivos carregados</span>' : ''}
        </div>
      </div>`;
  },

  init() {
    this.inputs.forEach(inp => {
      const input = document.getElementById(`file-${inp.key}`);
      if (input) {
        input.addEventListener('change', e => {
          if (e.target.files[0]) this.handleFile(inp.key, e.target.files[0]);
        });
      }
      const zone = document.getElementById(`drop-${inp.key}`);
      if (zone) {
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
          e.preventDefault(); zone.classList.remove('drag-over');
          const f = e.dataTransfer.files[0];
          if (f) this.handleFile(inp.key, f);
        });
        zone.addEventListener('click', () => document.getElementById(`file-${inp.key}`).click());
      }
    });

    const btn = document.getElementById('btn-processar');
    if (btn) btn.addEventListener('click', () => this.processar());
  },

  async handleFile(key, file) {
    App.state.fileStatus[key] = 'loading';
    App.state.errors[key] = [];
    App.state.parsed[key] = null;
    App.render();

    try {
      const parsers = { input01: 'parseInput01', input02: 'parseInput02', input03: 'parseInput03', input04: 'parseInput04' };
      const result = await Parser[parsers[key]](file);

      App.state.parsed[key] = result;
      App.state.errors[key] = result.errors || [];
      App.state.fileStatus[key] = (result.errors && result.errors.length > 0) ? 'error' : 'loaded';

      if (result.mesReferencia && !App.state.mesReferencia) {
        App.state.mesReferencia = result.mesReferencia;
      }
    } catch (err) {
      App.state.errors[key] = [`Erro inesperado: ${err.message}`];
      App.state.fileStatus[key] = 'error';
    }

    App.render();
  },

  processar() {
    const { parsed } = App.state;
    if (!parsed.input01 || !parsed.input02 || !parsed.input03 || !parsed.input04) return;

    const result = Engine.process(parsed.input01, parsed.input02, parsed.input03, parsed.input04);
    App.state.processedData = result;
    App.navigate('validacao');
  }
};
