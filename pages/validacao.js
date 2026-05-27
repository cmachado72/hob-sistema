const ValidacaoPage = {
  filter: 'ALL',

  render() {
    const data = App.state.processedData;

    if (!data) {
      return `
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="text-5xl mb-4">📋</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Nenhum dado processado</h2>
          <p class="text-gray-400 mb-6">Carregue os 4 inputs e clique em "Processar mês" primeiro.</p>
          <button onclick="App.navigate('upload')"
            class="px-5 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a9e] transition-colors">
            Ir para Upload →
          </button>
        </div>`;
    }

    const { mesReferencia, errors, alertas, resumo, pessoasAssocSocio } = data;
    const hasBlockers = errors.length > 0;
    const criticos = alertas.filter(a => a.tipo === 'VALOR_LIQUIDO_NEGATIVO' || a.tipo === 'SEM_DADOS_BANCARIOS');
    const avisos   = alertas.filter(a => !['VALOR_LIQUIDO_NEGATIVO','SEM_DADOS_BANCARIOS'].includes(a.tipo));
    const canApprove = !hasBlockers && criticos.length === 0;

    // Summary cards
    const cards = [
      { label: 'CLT',         value: resumo.total_clt,        color: 'bg-slate-50 border-slate-200',    icon: '👤' },
      { label: 'Associados',  value: resumo.total_associados, color: 'bg-blue-50 border-blue-200',      icon: '🤝' },
      { label: 'Sócios',      value: resumo.total_socios,     color: 'bg-purple-50 border-purple-200',  icon: '⭐' },
    ].map(c => `
      <div class="rounded-xl border ${c.color} p-4 text-center">
        <div class="text-2xl mb-1">${c.icon}</div>
        <div class="text-2xl font-bold text-gray-800">${c.value}</div>
        <div class="text-xs text-gray-500">${c.label}</div>
      </div>`).join('');

    const finCards = [
      { label: 'Total Bruto',     value: App.fmt(resumo.total_bruto),     color: 'bg-emerald-50 border-emerald-200' },
      { label: 'Total Descontos', value: App.fmt(resumo.total_descontos), color: 'bg-amber-50 border-amber-200' },
      { label: 'Total Líquido',   value: App.fmt(resumo.total_liquido),   color: 'bg-green-50 border-green-200' },
    ].map(c => `
      <div class="rounded-xl border ${c.color} p-4">
        <div class="text-xs text-gray-500 mb-1">${c.label}</div>
        <div class="text-lg font-bold text-gray-800">R$ ${c.value}</div>
      </div>`).join('');

    // Error blocks
    const errorsHtml = errors.length ? `
      <div class="rounded-xl border border-red-300 bg-red-50 p-4 mb-4">
        <div class="flex items-center gap-2 font-semibold text-red-700 mb-2">
          <span>🚫</span> ${errors.length} erro${errors.length !== 1 ? 's' : ''} bloqueante${errors.length !== 1 ? 's' : ''} — corrija os inputs e reprocesse
        </div>
        <div class="space-y-1">${errors.map(e => `<div class="text-xs text-red-600">› ${e}</div>`).join('')}</div>
      </div>` : '';

    const criticosHtml = criticos.length ? `
      <div class="rounded-xl border border-orange-300 bg-orange-50 p-4 mb-4">
        <div class="flex items-center gap-2 font-semibold text-orange-700 mb-2">
          <span>⚠️</span> ${criticos.length} alerta${criticos.length !== 1 ? 's' : ''} crítico${criticos.length !== 1 ? 's' : ''} — aprovação bloqueada
        </div>
        <div class="space-y-1">${criticos.map(a => `<div class="text-xs text-orange-700">› ${a.msg}</div>`).join('')}</div>
      </div>` : '';

    const avisosHtml = avisos.length ? `
      <div class="rounded-xl border border-yellow-300 bg-yellow-50 p-4 mb-4">
        <div class="flex items-center gap-2 font-semibold text-yellow-700 mb-2">
          <span>⚠</span> ${avisos.length} aviso${avisos.length !== 1 ? 's' : ''}
        </div>
        <div class="space-y-1">${avisos.map(a => `<div class="text-xs text-yellow-700">› ${a.msg}</div>`).join('')}</div>
      </div>` : '';

    const okHtml = !hasBlockers && criticos.length === 0 && avisos.length === 0 ? `
      <div class="rounded-xl border border-green-300 bg-green-50 p-4 mb-4 flex items-center gap-2 text-green-700 font-medium">
        <span>✅</span> Nenhum alerta ou erro encontrado. Dados prontos para aprovação.
      </div>` : '';

    // Filter bar
    const filters = [
      { val: 'ALL', label: 'Todos' },
      { val: 'ASSOCIADO', label: 'Associados' },
      { val: 'SOCIO', label: 'Sócios' }
    ];
    const filterBar = `
      <div class="flex gap-2 mb-3">
        ${filters.map(f => `
          <button onclick="ValidacaoPage.setFilter('${f.val}')"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors ${this.filter === f.val ? 'bg-[#1e3a5f] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}">
            ${f.label}
          </button>`).join('')}
      </div>`;

    const filtered = this.filter === 'ALL'
      ? pessoasAssocSocio
      : pessoasAssocSocio.filter(p => p.vinculo === this.filter);

    const rows = filtered.map(p => {
      const liqOk = p.valor_liquido > 0;
      const hasBank = p.num_banco;
      const rowCls = !liqOk ? 'bg-red-50' : !hasBank ? 'bg-orange-50' : '';
      return `
        <tr class="${rowCls}">
          <td class="px-3 py-2 text-xs font-mono">${p.id_pessoa}</td>
          <td class="px-3 py-2 text-xs">${p.nome_completo}</td>
          <td class="px-3 py-2 text-xs">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${p.vinculo === 'ASSOCIADO' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
              ${p.vinculo}
            </span>
          </td>
          <td class="px-3 py-2 text-xs text-gray-500">${p.centro_custo}</td>
          <td class="px-3 py-2 text-xs text-right font-mono">R$ ${App.fmt(p.pro_labore_bruto)}</td>
          <td class="px-3 py-2 text-xs text-right font-mono text-red-600">- R$ ${App.fmt(p.total_descontos)}</td>
          <td class="px-3 py-2 text-xs text-right font-mono font-semibold ${liqOk ? 'text-green-700' : 'text-red-600'}">
            R$ ${App.fmt(p.valor_liquido)}
          </td>
          <td class="px-3 py-2 text-xs text-center">
            ${hasBank ? '✅' : '<span class="text-orange-500" title="Sem dados bancários">⚠️</span>'}
          </td>
        </tr>`;
    }).join('');

    const table = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="px-3 py-2.5 text-xs">ID</th>
              <th class="px-3 py-2.5 text-xs">Nome</th>
              <th class="px-3 py-2.5 text-xs">Vínculo</th>
              <th class="px-3 py-2.5 text-xs">CC</th>
              <th class="px-3 py-2.5 text-xs text-right">Pró-labore Bruto</th>
              <th class="px-3 py-2.5 text-xs text-right">Descontos</th>
              <th class="px-3 py-2.5 text-xs text-right">Valor Líquido</th>
              <th class="px-3 py-2.5 text-xs text-center">Banco</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">${rows}</tbody>
        </table>
      </div>`;

    const btnCls = canApprove
      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-md'
      : 'bg-slate-200 text-slate-400 cursor-not-allowed';

    return `
      <div>
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Validação do Mês</h1>
            <p class="text-sm text-gray-500 mt-1">Mês de referência: <strong>${mesReferencia || '—'}</strong></p>
          </div>
          <button onclick="App.navigate('upload')"
            class="text-sm text-slate-500 hover:text-slate-700 underline">← Voltar ao upload</button>
        </div>

        <!-- Resumo -->
        <div class="grid grid-cols-3 gap-3 mb-4">${cards}</div>
        <div class="grid grid-cols-3 gap-3 mb-6">${finCards}</div>

        <!-- Alertas e erros -->
        ${errorsHtml}${criticosHtml}${avisosHtml}${okHtml}

        <!-- Tabela -->
        <div class="mb-6">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Detalhamento por pessoa — ${pessoasAssocSocio.length} registro(s)</h2>
          ${filterBar}
          ${table}
        </div>

        <!-- Ação -->
        <div class="flex items-center gap-4 pt-4 border-t border-slate-200">
          <button id="btn-aprovar" ${canApprove ? '' : 'disabled'}
            class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${btnCls}">
            ✓ Aprovar e gerar outputs
          </button>
          ${!canApprove ? `<span class="text-sm text-slate-500">Corrija os erros críticos para liberar a aprovação</span>` : ''}
        </div>
      </div>`;
  },

  init() {
    const btn = document.getElementById('btn-aprovar');
    if (btn) btn.addEventListener('click', () => this.aprovar());
  },

  setFilter(f) {
    this.filter = f;
    App.render();
  },

  aprovar() {
    const data = App.state.processedData;
    if (!data) return;

    const mesRef = data.mesReferencia;
    const params = Storage.getParams();

    Exporter.generateOutput01(data, mesRef);
    Exporter.generateOutput02(data, mesRef, params);

    // Save to history
    Storage.saveMonth(mesRef, {
      mes_referencia: mesRef,
      data_processamento: new Date().toISOString(),
      resumo: data.resumo,
      pessoas: data.pessoasAssocSocio.map(p => ({
        id_pessoa:        p.id_pessoa,
        nome:             p.nome_completo,
        cpf:              p.cpf,
        vinculo:          p.vinculo,
        centro_custo:     p.centro_custo,
        area:             p.area,
        pro_labore_bruto: p.pro_labore_bruto,
        adiantamento:     p.adiantamento,
        comissao:         p.comissao,
        outros_creditos:  p.outros_creditos,
        total_descontos:  p.total_descontos,
        valor_liquido:    p.valor_liquido,
        num_banco:        p.num_banco,
        agencia:          p.agencia,
        conta:            p.conta,
        observacao:       p.observacao
      })),
      todasPessoas: data.todasPessoas
    });

    // Reset upload state for next month
    App.state.files     = { input01: null, input02: null, input03: null, input04: null };
    App.state.parsed    = { input01: null, input02: null, input03: null, input04: null };
    App.state.fileStatus= { input01: 'waiting', input02: 'waiting', input03: 'waiting', input04: 'waiting' };
    App.state.errors    = { input01: [], input02: [], input03: [], input04: [] };
    App.state.mesReferencia = null;
    App.state.processedData = null;

    App.navigate('historico');
  }
};
