const ParametrosPage = {

  // Event code → tipo_verba mapping (first match in array wins)
  TIPO_EVENTS: {
    SALARIO:   [1],
    INSS:      [30335, 11],
    IRRF:      [13],
    FGTS:      [30334],
    BENEFICIO: [109, 143, 1049]
  },

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

        <!-- Seção 0: Importar do arquivo HOB_Contas -->
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">↑</span>
          Importar contas do arquivo HOB_Contas (opcional)
        </h2>
        <div class="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 mb-6">
          <p class="text-xs text-slate-500 mb-4">
            Faça upload do arquivo <strong>HOB_Contas para Integração_Fopag_AAAA.xlsx</strong> para preencher
            automaticamente os campos de débito e crédito dos vínculos CLT nas seções abaixo.
            Os tipos <em>Pró-labore</em>, <em>Descontos Benef.</em> e <em>Outros</em> não constam nesse arquivo e devem ser configurados manualmente.
          </p>

          <div id="import-dropzone"
            class="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors group">
            <div class="flex flex-col items-center gap-2 pointer-events-none">
              <svg class="w-8 h-8 text-indigo-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-sm text-indigo-500 font-medium">Arraste o arquivo aqui</p>
              <p class="text-xs text-slate-400">ou</p>
              <label class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm pointer-events-auto">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Selecionar arquivo
                <input type="file" id="import-contas-input" accept=".xlsx,.xls" class="hidden">
              </label>
              <p class="text-xs text-slate-400 mt-1">HOB_Contas para Integração_Fopag_AAAA.xlsx</p>
            </div>
          </div>

          <div id="import-contas-preview" class="hidden"></div>
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

    // Import feature — file input
    const importInput = document.getElementById('import-contas-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) this.importContas(f);
        e.target.value = '';
      });
    }

    // Import feature — drag-and-drop
    const dropzone = document.getElementById('import-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-400', 'bg-indigo-50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-indigo-400', 'bg-indigo-50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-400', 'bg-indigo-50');
        const f = e.dataTransfer.files[0];
        if (f) this.importContas(f);
      });
    }
  },

  // ─── Import logic ───────────────────────────────────────────────

  importContas(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' });
        // Prefer sheet named "BD", fallback to first sheet
        const ws   = wb.Sheets['BD'] || wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Find header row (look for CÓD / EVENTO in first 6 rows)
        let headerRow = -1;
        for (let i = 0; i < Math.min(data.length, 6); i++) {
          const row = data[i].map(c => String(c).toUpperCase());
          if (row.some(c => c.includes('EVENTO') || (c.includes('CÓD') && c.includes('EVEN')))) {
            headerRow = i;
            break;
          }
        }
        if (headerRow === -1) {
          alert('Não foi possível identificar o cabeçalho da planilha.\nVerifique se é o arquivo correto (aba "BD" com coluna "CÓD. EVENTO").');
          return;
        }

        const headers = data[headerRow].map(h => String(h).trim().toUpperCase());

        // Locate columns by header text
        const codIdx    = headers.findIndex(h => h.includes('CÓD') || (h.includes('COD') && h.includes('EVEN')));
        const nomeEvIdx = headers.findIndex(h => h.includes('NOME') && h.includes('EVENTO'));
        const debIdx    = headers.findIndex(h => h.startsWith('DÉB') || h.startsWith('DEB') || h === 'DÉBITO');
        const creIdx    = headers.findIndex(h => h.startsWith('CRÉ') || h.startsWith('CRE') || h === 'CRÉDITO');
        const regraIdx  = headers.findIndex(h => h.includes('REGRA'));

        // "NOME CONTA CONTÁBIL" appears twice — first after DÉBITO, second after CRÉDITO
        let nomeDebIdx = -1;
        let nomeCreIdx = -1;
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if ((h.includes('NOME') && h.includes('CONT')) || h === 'NOME CONTA CONTÁBIL' || h === 'NOME CONTA CONTABIL') {
            if (nomeDebIdx === -1 && i > debIdx) nomeDebIdx = i;
            else if (nomeCreIdx === -1 && i > creIdx) nomeCreIdx = i;
          }
        }
        // Fallback: assume they're directly after DEB and CRE columns
        if (nomeDebIdx === -1 && debIdx >= 0) nomeDebIdx = debIdx + 1;
        if (nomeCreIdx === -1 && creIdx >= 0) nomeCreIdx = creIdx + 1;

        // Index all event rows by code
        const eventMap = {};
        let regra = '';
        for (let i = headerRow + 1; i < data.length; i++) {
          const row = data[i];
          const rawCod = String(row[codIdx] ?? '').trim();
          if (!rawCod) continue;
          const codNum = Number(rawCod);
          if (isNaN(codNum) || codNum === 0) continue;

          if (regraIdx >= 0 && row[regraIdx]) regra = String(row[regraIdx]).trim();

          eventMap[codNum] = {
            cod:      codNum,
            nome:     String(row[nomeEvIdx] ?? '').trim(),
            debito:   String(row[debIdx]    ?? '').trim(),
            nomeDeb:  String(row[nomeDebIdx]?? '').trim(),
            credito:  String(row[creIdx]    ?? '').trim(),
            nomeCred: String(row[nomeCreIdx]?? '').trim()
          };
        }

        // Map event codes to tipos
        const result = {};
        for (const [tipo, codes] of Object.entries(this.TIPO_EVENTS)) {
          for (const cod of codes) {
            if (eventMap[cod]) {
              result[tipo] = { ...eventMap[cod], tipo };
              break;
            }
          }
        }

        if (Object.keys(result).length === 0) {
          alert('Nenhum código de evento reconhecido foi encontrado na planilha.\nVerifique se o arquivo contém os códigos esperados (ex: 1 — SALÁRIO, 30334 — FGTS, etc.).');
          return;
        }

        this._showImportPreview(result, regra);

      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  _showImportPreview(result, regra) {
    const tipoLabels = {
      SALARIO:   'Salário Bruto',
      INSS:      'INSS',
      IRRF:      'IRRF',
      FGTS:      'FGTS',
      BENEFICIO: 'Benefícios'
    };

    const rows = Object.keys(tipoLabels).map(tipo => {
      const r = result[tipo];
      if (!r) {
        return `
          <tr class="bg-amber-50">
            <td class="px-3 py-2.5 text-xs font-semibold text-gray-700">${tipoLabels[tipo]}</td>
            <td class="px-3 py-2.5 text-xs text-amber-600 italic" colspan="4">Código não encontrado — linha mantida sem alteração</td>
          </tr>`;
      }
      return `
        <tr class="hover:bg-slate-50">
          <td class="px-3 py-2.5">
            <div class="text-xs font-semibold text-gray-800">${tipoLabels[tipo]}</div>
          </td>
          <td class="px-3 py-2.5">
            <div class="text-xs font-mono text-slate-600">${r.cod}</div>
            <div class="text-xs text-slate-400 mt-0.5">${r.nome}</div>
          </td>
          <td class="px-3 py-2.5">
            <div class="text-xs font-mono text-gray-800">${r.debito}</div>
            <div class="text-xs text-slate-400 mt-0.5 leading-tight">${r.nomeDeb}</div>
          </td>
          <td class="px-3 py-2.5">
            <div class="text-xs font-mono text-gray-800">${r.credito}</div>
            <div class="text-xs text-slate-400 mt-0.5 leading-tight">${r.nomeCred}</div>
          </td>
        </tr>`;
    }).join('');

    const regraHtml = regra
      ? `<div class="mt-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-2.5 text-xs text-indigo-700">
           <strong>Regra de distribuição detectada:</strong> <span class="font-mono">${regra}</span>
           — será aplicada ao campo <em>Regra distr.</em> nos parâmetros globais.
         </div>`
      : '';

    const notesHtml = `
      <p class="text-xs text-slate-400 mt-2">
        <strong>Nota:</strong> Os tipos <em>Pró-labore</em>, <em>Descontos Benef.</em> e <em>Outros</em>
        não constam nesse arquivo e permanecerão com os valores atuais.
        Para o tipo <em>Benefícios</em>, é usado o primeiro código identificado (Cód. 109 — VT, 143 — VR ou 1049 — Assist. Médica).
      </p>`;

    const preview = document.getElementById('import-contas-preview');
    preview.innerHTML = `
      <div class="mt-4 border border-slate-200 rounded-xl overflow-hidden">
        <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <span class="text-xs font-semibold text-slate-700">Prévia da importação</span>
        </div>
        <table class="w-full text-left border-collapse">
          <thead class="bg-white border-b border-slate-100">
            <tr>
              <th class="px-3 py-2 text-xs font-semibold text-slate-500">Tipo de Verba</th>
              <th class="px-3 py-2 text-xs font-semibold text-slate-500">Evento (cód. + nome)</th>
              <th class="px-3 py-2 text-xs font-semibold text-slate-500">Conta Débito</th>
              <th class="px-3 py-2 text-xs font-semibold text-slate-500">Conta Crédito</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">${rows}</tbody>
        </table>
      </div>
      ${regraHtml}
      ${notesHtml}
      <div class="mt-4 flex items-center gap-3">
        <button id="btn-apply-import"
          class="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Aplicar importação
        </button>
        <button id="btn-cancel-import"
          class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>`;

    preview.classList.remove('hidden');
    this._pendingImport = { result, regra };

    document.getElementById('btn-apply-import').addEventListener('click', () => this._applyImport());
    document.getElementById('btn-cancel-import').addEventListener('click', () => {
      preview.classList.add('hidden');
      preview.innerHTML = '';
      this._pendingImport = null;
    });
  },

  _applyImport() {
    if (!this._pendingImport) return;
    const { result, regra } = this._pendingImport;

    // Limpar todos os campos CLT antes de preencher (importação sobrepõe a anterior)
    const cltTipos = ['SALARIO', 'INSS', 'IRRF', 'FGTS', 'BENEFICIO'];
    const camposContas = ['debito', 'nome_debito', 'credito', 'nome_credito'];
    cltTipos.forEach(tipo => {
      camposContas.forEach(campo => {
        const input = document.querySelector(`input[data-tipo="${tipo}"][data-campo="${campo}"]`);
        if (input) input.value = '';
      });
    });

    // Preencher com os valores importados
    for (const [tipo, r] of Object.entries(result)) {
      const fields = {
        debito:       r.debito,
        nome_debito:  r.nomeDeb,
        credito:      r.credito,
        nome_credito: r.nomeCred
      };
      for (const [campo, val] of Object.entries(fields)) {
        const input = document.querySelector(`input[data-tipo="${tipo}"][data-campo="${campo}"]`);
        if (input) input.value = val;
      }
    }

    // Auto-fill regra_distribuicao in global params
    if (regra) {
      const regraInput = document.querySelector('input[data-plc="regra_distribuicao"]');
      if (regraInput) regraInput.value = regra;
    }

    // Save everything
    this.save();

    // Hide preview
    const preview = document.getElementById('import-contas-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
    this._pendingImport = null;
  },

  // ─── Save ────────────────────────────────────────────────────────

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
