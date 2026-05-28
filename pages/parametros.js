const ParametrosPage = {
  render() {
    const params = Storage.getParams();
    const contas = params.contasContabeis;
    const g      = params.plc_global || {};

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

    const contaRows = tipos.map(t => {
      const c = contas[t.key] || {};
      const inp = (campo, val, placeholder) =>
        `<input type="text" data-tipo="${t.key}" data-campo="${campo}" value="${val || ''}"
          class="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
          placeholder="${placeholder}">`;

      return `
        <tr>
          <td class="px-3 py-2.5">
            <div class="text-xs font-semibold text-gray-800">${t.label}</div>
            <div class="text-xs text-gray-400 font-mono mt-0.5">${t.key}</div>
          </td>
          <td class="px-3 py-2.5"><span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">${t.vinculo}</span></td>
          <td class="px-3 py-2.5">${inp('debito',      c.debito,      '6.1.1.01')}</td>
          <td class="px-3 py-2.5">${inp('nome_debito', c.nome_debito, 'Nome da conta débito')}</td>
          <td class="px-3 py-2.5">${inp('credito',      c.credito,      '2.1.3.01')}</td>
          <td class="px-3 py-2.5">${inp('nome_credito', c.nome_credito, 'Nome da conta crédito')}</td>
        </tr>`;
    }).join('');

    const globalInp = (id, campo, val, placeholder, label) =>
      `<div>
        <label class="text-xs font-medium text-gray-600 block mb-1">${label}</label>
        <input type="text" id="plc-${id}" data-plc="${campo}" value="${val || ''}"
          class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
          placeholder="${placeholder}">
      </div>`;

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Parâmetros</h1>
          <p class="text-sm text-gray-500 mt-1">Configure as contas contábeis e campos fixos do layout SAP para o PLC.</p>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex gap-3">
          <span class="text-amber-500 text-base shrink-0 font-bold mt-0.5">⚠</span>
          <p class="text-sm text-amber-700">
            As configurações abaixo definem o arquivo <strong>HOB_PLC_AAAA-MM.xlsx</strong> gerado na aprovação.
            As colunas seguem o <strong>Modelo PLC.xlsx</strong> (layout SAP).
            Parâmetros salvos no <code class="bg-amber-100 px-1 rounded">localStorage</code>.
          </p>
        </div>

        <div id="save-feedback" class="hidden mb-4 rounded-xl border border-green-300 bg-green-50 p-3 flex items-center gap-2 text-green-700 text-sm font-medium">
          <span>✅</span> Parâmetros salvos com sucesso.
        </div>

        <!-- Seção 1: Campos globais PLC -->
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold">1</span>
          Campos globais do PLC (aplicados a todas as linhas)
        </h2>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <div class="grid grid-cols-2 gap-4">
            ${globalInp('proj', 'projeto_financeiro', g.projeto_financeiro, 'ex: 005232', 'Projeto Financeiro')}
            ${globalInp('regra', 'regra_distribuicao', g.regra_distribuicao, 'ex: 4700', 'Regra distr.')}
            ${globalInp('dept', 'departamento_padrao', g.departamento_padrao, 'ex: 1601', 'Departamento (cód. SAP)')}
            ${globalInp('filial', 'filial', g.filial, 'ex: HoB Associados em Consultoria...', 'Filial')}
          </div>
          <p class="text-xs text-slate-400 mt-3">
            Estes valores preenchem as colunas <em>Projeto Financeiro</em>, <em>Regra distr.</em>, <em>Departamento</em> e <em>Filial</em> em todas as linhas do PLC.
            A coluna <em>Área</em> é preenchida automaticamente com o Centro de Custo de cada pessoa.
          </p>
        </div>

        <!-- Seção 2: Contas contábeis -->
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold">2</span>
          Contas contábeis por tipo de verba
        </h2>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto mb-6">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr>
                <th class="px-3 py-3 text-xs">Tipo de Verba</th>
                <th class="px-3 py-3 text-xs">Vínculo</th>
                <th class="px-3 py-3 text-xs">Cta. Débito<br><span class="font-normal text-slate-400">(Cta.contáb./cód.PN)</span></th>
                <th class="px-3 py-3 text-xs">Nome Débito<br><span class="font-normal text-slate-400">(Cta.cont./Nome PN)</span></th>
                <th class="px-3 py-3 text-xs">Cta. Crédito<br><span class="font-normal text-slate-400">(Cta.contáb./cód.PN)</span></th>
                <th class="px-3 py-3 text-xs">Nome Crédito<br><span class="font-normal text-slate-400">(Cta.cont./Nome PN)</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${contaRows}</tbody>
          </table>
        </div>

        <p class="text-xs text-slate-400 mb-5">
          Cada verba gera <strong>2 linhas</strong> no PLC: uma de débito (valor na col. <em>Débito</em>) e uma de crédito (valor na col. <em>Crédito</em>).
        </p>

        <div class="flex items-center gap-4 pt-4 border-t border-slate-200">
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
      Storage.saveParams(Storage.getDefaultParams());
      App.render();
    });
  },

  save() {
    const params = Storage.getParams();

    // Salvar contas contábeis
    document.querySelectorAll('input[data-tipo]').forEach(input => {
      const tipo  = input.dataset.tipo;
      const campo = input.dataset.campo;
      if (!params.contasContabeis[tipo]) params.contasContabeis[tipo] = {};
      params.contasContabeis[tipo][campo] = input.value.trim();
    });

    // Salvar parâmetros globais PLC
    if (!params.plc_global) params.plc_global = {};
    document.querySelectorAll('input[data-plc]').forEach(input => {
      params.plc_global[input.dataset.plc] = input.value.trim();
    });

    Storage.saveParams(params);

    const fb = document.getElementById('save-feedback');
    if (fb) {
      fb.classList.remove('hidden');
      setTimeout(() => fb.classList.add('hidden'), 3000);
    }
  }
};
