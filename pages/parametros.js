const ParametrosPage = {
  editingParams: null,

  render() {
    const params = this.editingParams || Storage.getParams();
    const contas = params.contasContabeis;

    const tipos = [
      { key: 'PRO_LABORE', label: 'Pró-labore',       vinculo: 'ASSOCIADO / SOCIO' },
      { key: 'DESCONTO',   label: 'Descontos Benef.', vinculo: 'ASSOCIADO / SOCIO' },
      { key: 'SALARIO',    label: 'Salário Bruto',    vinculo: 'CLT' },
      { key: 'INSS',       label: 'INSS',             vinculo: 'CLT' },
      { key: 'IRRF',       label: 'IRRF',             vinculo: 'CLT' },
      { key: 'FGTS',       label: 'FGTS',             vinculo: 'CLT' },
      { key: 'BENEFICIO',  label: 'Benefícios',       vinculo: 'CLT' },
      { key: 'OUTROS',     label: 'Outros',           vinculo: 'Todos' }
    ];

    const rows = tipos.map(t => {
      const c = contas[t.key] || { debito: '', credito: '', descricao: '' };
      return `
        <tr>
          <td class="px-4 py-3">
            <div class="text-xs font-semibold text-gray-800">${t.label}</div>
            <div class="text-xs text-gray-400 font-mono mt-0.5">${t.key}</div>
          </td>
          <td class="px-4 py-3">
            <span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">${t.vinculo}</span>
          </td>
          <td class="px-4 py-3">
            <input type="text" data-tipo="${t.key}" data-campo="debito" value="${c.debito}"
              class="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
              placeholder="ex: 6.1.1.01">
          </td>
          <td class="px-4 py-3">
            <input type="text" data-tipo="${t.key}" data-campo="credito" value="${c.credito}"
              class="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
              placeholder="ex: 2.1.3.01">
          </td>
          <td class="px-4 py-3">
            <input type="text" data-tipo="${t.key}" data-campo="descricao" value="${c.descricao}"
              class="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
              placeholder="Descrição da verba">
          </td>
        </tr>`;
    }).join('');

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Parâmetros</h1>
          <p class="text-sm text-gray-500 mt-1">Configure as contas contábeis do plano de contas SAP para geração do PLC.</p>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex gap-3">
          <span class="text-amber-500 text-base shrink-0 font-bold mt-0.5">⚠</span>
          <p class="text-sm text-amber-700">
            As contas contábeis devem corresponder ao plano de contas SAP da HOB.
            Alterações aqui afetam a geração do <strong>OUTPUT_02 — Pré-Lançamentos Contábeis (PLC)</strong>.
            Os parâmetros são salvos no <code class="bg-amber-100 px-1 rounded">localStorage</code> do browser.
          </p>
        </div>

        <div id="save-feedback" class="hidden mb-4 rounded-xl border border-green-300 bg-green-50 p-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <span>✅</span> Parâmetros salvos com sucesso.
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr>
                <th class="px-4 py-3 text-xs">Tipo de Verba</th>
                <th class="px-4 py-3 text-xs">Vínculo</th>
                <th class="px-4 py-3 text-xs">Conta Débito</th>
                <th class="px-4 py-3 text-xs">Conta Crédito</th>
                <th class="px-4 py-3 text-xs">Descrição</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${rows}</tbody>
          </table>
        </div>

        <div class="flex items-center gap-4">
          <button id="btn-salvar"
            class="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white rounded-lg font-semibold text-sm transition-colors shadow-md cursor-pointer">
            Salvar parâmetros
          </button>
          <button id="btn-reset"
            class="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
            Restaurar padrões
          </button>
        </div>
      </div>`;
  },

  init() {
    document.getElementById('btn-salvar').addEventListener('click', () => this.save());
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (!confirm('Restaurar todos os parâmetros para os valores padrão?')) return;
      this.editingParams = null;
      Storage.saveParams(Storage.getDefaultParams());
      App.render();
    });
  },

  save() {
    const params = Storage.getParams();
    document.querySelectorAll('input[data-tipo]').forEach(input => {
      const tipo  = input.dataset.tipo;
      const campo = input.dataset.campo;
      if (!params.contasContabeis[tipo]) params.contasContabeis[tipo] = {};
      params.contasContabeis[tipo][campo] = input.value.trim();
    });
    Storage.saveParams(params);
    this.editingParams = null;

    const fb = document.getElementById('save-feedback');
    if (fb) {
      fb.classList.remove('hidden');
      setTimeout(() => fb.classList.add('hidden'), 3000);
    }
  }
};
