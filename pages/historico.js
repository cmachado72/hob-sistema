const HistoricoPage = {
  filters: { vinculo: '', cc: '' },

  render() {
    const months = Storage.getAllMonths();

    if (months.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="text-5xl mb-4">📋</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Histórico vazio</h2>
          <p class="text-gray-400 mb-6">Nenhum mês processado ainda. Carregue os inputs e aprove o mês para gerar o histórico.</p>
          <button onclick="App.navigate('upload')"
            class="px-5 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a9e]">
            Ir para Upload →
          </button>
        </div>`;
    }

    // Collect all CCs for filter
    const allCCs = [...new Set(months.flatMap(m => (m.pessoas || []).map(p => p.centro_custo).filter(Boolean)))].sort();

    // Filter people across all months
    let allPeople = months.flatMap(m =>
      (m.pessoas || []).map(p => ({ ...p, mes_referencia: m.mes_referencia, data_proc: m.data_processamento }))
    );
    if (this.filters.vinculo) allPeople = allPeople.filter(p => p.vinculo === this.filters.vinculo);
    if (this.filters.cc)      allPeople = allPeople.filter(p => p.centro_custo === this.filters.cc);

    // Summary across filtered
    const totalBruto     = allPeople.reduce((s, p) => s + (p.pro_labore_bruto || 0), 0);
    const totalDescontos = allPeople.reduce((s, p) => s + (p.total_descontos || 0), 0);
    const totalLiquido   = allPeople.reduce((s, p) => s + (p.valor_liquido || 0), 0);

    const summaryCards = [
      { label: 'Meses processados', value: months.length,       color: 'bg-blue-50 border-blue-200' },
      { label: 'Registros (filtro)', value: allPeople.length,   color: 'bg-slate-50 border-slate-200' },
      { label: 'Total Bruto',        value: `R$ ${App.fmt(totalBruto)}`,    color: 'bg-emerald-50 border-emerald-200' },
      { label: 'Total Descontos',    value: `R$ ${App.fmt(totalDescontos)}`,color: 'bg-amber-50 border-amber-200' },
      { label: 'Total Líquido',      value: `R$ ${App.fmt(totalLiquido)}`,  color: 'bg-green-50 border-green-200' },
    ].map(c => `
      <div class="rounded-xl border ${c.color} p-4">
        <div class="text-xs text-gray-500 mb-1">${c.label}</div>
        <div class="text-lg font-bold text-gray-800">${c.value}</div>
      </div>`).join('');

    // Month cards
    const monthCards = months.map(m => {
      const r = m.resumo || {};
      const date = m.data_processamento ? new Date(m.data_processamento).toLocaleDateString('pt-BR') : '—';
      return `
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="font-bold text-gray-800 text-base">${m.mes_referencia}</div>
              <div class="text-xs text-gray-400">Processado em ${date}</div>
            </div>
            <div class="flex gap-2">
              <button onclick="HistoricoPage.reexport01('${m.mes_referencia}')"
                title="Re-exportar Pagamentos SAP"
                class="px-2.5 py-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                💾 Pagamentos
              </button>
              <button onclick="HistoricoPage.reexport02('${m.mes_referencia}')"
                title="Re-exportar PLC"
                class="px-2.5 py-1 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                💾 PLC
              </button>
              <button onclick="HistoricoPage.confirmDelete('${m.mes_referencia}')"
                title="Excluir mês do histórico"
                class="px-2.5 py-1 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                🗑
              </button>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-slate-50 rounded-lg p-2">
              <div class="text-sm font-semibold">${r.total_clt || 0}</div>
              <div class="text-xs text-gray-400">CLT</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-2">
              <div class="text-sm font-semibold">${r.total_associados || 0}</div>
              <div class="text-xs text-gray-400">Assoc.</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-2">
              <div class="text-sm font-semibold">${r.total_socios || 0}</div>
              <div class="text-xs text-gray-400">Sócios</div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span class="text-gray-500">Bruto: <span class="font-medium text-gray-700">R$ ${App.fmt(r.total_bruto)}</span></span>
            <span class="text-gray-500">Líquido: <span class="font-semibold text-green-700">R$ ${App.fmt(r.total_liquido)}</span></span>
          </div>
        </div>`;
    }).join('');

    // Detail table
    const tableRows = allPeople.map(p => `
      <tr>
        <td class="px-3 py-2 text-xs font-medium">${p.mes_referencia}</td>
        <td class="px-3 py-2 text-xs font-mono">${p.id_pessoa}</td>
        <td class="px-3 py-2 text-xs">${p.nome || p.nome_completo || ''}</td>
        <td class="px-3 py-2 text-xs">
          <span class="px-1.5 py-0.5 rounded-full text-xs font-medium ${
            p.vinculo === 'ASSOCIADO' ? 'bg-blue-100 text-blue-700' :
            p.vinculo === 'SOCIO'     ? 'bg-purple-100 text-purple-700' :
                                        'bg-slate-100 text-slate-600'}">
            ${p.vinculo}
          </span>
        </td>
        <td class="px-3 py-2 text-xs text-gray-500">${p.centro_custo || ''}</td>
        <td class="px-3 py-2 text-xs text-right font-mono">R$ ${App.fmt(p.pro_labore_bruto)}</td>
        <td class="px-3 py-2 text-xs text-right font-mono text-red-600">- R$ ${App.fmt(p.total_descontos)}</td>
        <td class="px-3 py-2 text-xs text-right font-mono font-semibold text-green-700">R$ ${App.fmt(p.valor_liquido)}</td>
      </tr>`).join('');

    const vincOptions = ['', 'ASSOCIADO', 'SOCIO'].map(v =>
      `<option value="${v}" ${this.filters.vinculo === v ? 'selected' : ''}>${v || 'Todos os vínculos'}</option>`
    ).join('');

    const ccOptions = ['', ...allCCs].map(cc =>
      `<option value="${cc}" ${this.filters.cc === cc ? 'selected' : ''}>${cc || 'Todos os CCs'}</option>`
    ).join('');

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Histórico e Consultas</h1>
          <p class="text-sm text-gray-500 mt-1">${months.length} mês${months.length !== 1 ? 'es' : ''} processado${months.length !== 1 ? 's' : ''} no histórico local.</p>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-5 gap-3 mb-6">${summaryCards}</div>

        <!-- Month cards -->
        <h2 class="text-sm font-semibold text-gray-700 mb-3">Meses processados</h2>
        <div class="grid grid-cols-2 gap-4 mb-8">${monthCards}</div>

        <!-- Filters + Detail table -->
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-sm font-semibold text-gray-700">Registros detalhados</h2>
          <select onchange="HistoricoPage.setFilter('vinculo', this.value)"
            class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600">
            ${vincOptions}
          </select>
          <select onchange="HistoricoPage.setFilter('cc', this.value)"
            class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600">
            ${ccOptions}
          </select>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr>
                <th class="px-3 py-2.5 text-xs">Mês</th>
                <th class="px-3 py-2.5 text-xs">ID</th>
                <th class="px-3 py-2.5 text-xs">Nome</th>
                <th class="px-3 py-2.5 text-xs">Vínculo</th>
                <th class="px-3 py-2.5 text-xs">CC</th>
                <th class="px-3 py-2.5 text-xs text-right">Bruto</th>
                <th class="px-3 py-2.5 text-xs text-right">Descontos</th>
                <th class="px-3 py-2.5 text-xs text-right">Líquido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${tableRows || '<tr><td colspan="8" class="px-3 py-6 text-center text-xs text-slate-400">Nenhum registro encontrado para os filtros selecionados</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
  },

  init() {},

  setFilter(key, value) {
    this.filters[key] = value;
    App.render();
  },

  reexport01(mesRef) {
    const record = Storage.getMonth(mesRef);
    if (!record) { alert('Dados do mês não encontrados.'); return; }
    Exporter.reexportOutput01(record);
  },

  reexport02(mesRef) {
    const record = Storage.getMonth(mesRef);
    if (!record) { alert('Dados do mês não encontrados.'); return; }
    Exporter.reexportOutput02(record);
  },

  confirmDelete(mesRef) {
    if (!confirm(`Excluir o mês ${mesRef} do histórico? Esta ação não pode ser desfeita.`)) return;
    Storage.deleteMonth(mesRef);
    App.render();
  }
};
