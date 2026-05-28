const ParametrosPage = {

  render() {
    const params = Storage.getParams();
    const rows   = params.contas_raw;
    const loaded = Array.isArray(rows) && rows.length > 0;

    // ── Tabela read-only (exibida após upload) ──────────────────────
    const tabelaHtml = loaded ? `
      <div class="mt-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">CÓD. EVENTO</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600">NOME DO EVENTO</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">DÉBITO</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600">NOME CONTA CONTÁBIL</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">CRÉDITO</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600">NOME CONTA CONTÁBIL</th>
              <th class="px-3 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">REGRA</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rows.map(r => `
              <tr class="hover:bg-slate-50">
                <td class="px-3 py-2 text-xs font-mono text-gray-700">${r.cod_evento ?? ''}</td>
                <td class="px-3 py-2 text-xs text-gray-800">${r.nome_evento ?? ''}</td>
                <td class="px-3 py-2 text-xs font-mono text-gray-700">${r.debito ?? ''}</td>
                <td class="px-3 py-2 text-xs text-gray-600">${r.nome_debito ?? ''}</td>
                <td class="px-3 py-2 text-xs font-mono text-gray-700">${r.credito ?? ''}</td>
                <td class="px-3 py-2 text-xs text-gray-600">${r.nome_credito ?? ''}</td>
                <td class="px-3 py-2 text-xs font-mono text-gray-500">${r.regra ?? ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    // ── Estado do arquivo ───────────────────────────────────────────
    const arquivoStatus = loaded
      ? `<div class="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-4">
           <div class="flex items-center gap-3">
             <svg class="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
             </svg>
             <div>
               <p class="text-sm font-semibold text-green-800">Arquivo carregado</p>
               <p class="text-xs text-green-600">${rows.length} eventos · última importação salva no localStorage</p>
             </div>
           </div>
           <label class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-300 text-green-700 bg-white rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
             </svg>
             Substituir arquivo
             <input type="file" id="import-file-input" accept=".xlsx,.xls" class="hidden">
           </label>
         </div>`
      : `<div id="import-dropzone"
           class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group">
           <svg class="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
           </svg>
           <p class="text-sm font-medium text-slate-500 group-hover:text-blue-600">Arraste o arquivo aqui</p>
           <p class="text-xs text-slate-400 mt-1 mb-4">HOB_Contas para Integração_Fopag_AAAA.xlsx</p>
           <label class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm pointer-events-auto">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
             </svg>
             Selecionar arquivo
             <input type="file" id="import-file-input" accept=".xlsx,.xls" class="hidden">
           </label>
         </div>`;

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Parâmetros</h1>
          <p class="text-sm text-gray-500 mt-1">Carregue o arquivo de contas contábeis usado na geração do PLC.</p>
        </div>

        <!-- Seção 1: Arquivo de contas contábeis -->
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold">1</span>
          Arquivo de contas contábeis
        </h2>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-8">
          <p class="text-xs text-slate-500 mb-4">
            Faça upload do arquivo <strong>HOB_Contas para Integração_Fopag_AAAA.xlsx</strong>.
            Os dados são armazenados como recebidos, sem alterações, e usados na geração do PLC.
          </p>
          ${arquivoStatus}
          ${tabelaHtml}
        </div>

      </div>`;
  },

  init() {
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) this.loadFile(f);
        e.target.value = '';
      });
    }

    const dropzone = document.getElementById('import-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-blue-400', 'bg-blue-50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-blue-400', 'bg-blue-50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-400', 'bg-blue-50');
        const f = e.dataTransfer.files[0];
        if (f) this.loadFile(f);
      });
    }
  },

  // ─── Carregamento do arquivo ─────────────────────────────────────

  loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' });
        const ws   = wb.Sheets['BD'] || wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Localizar linha de cabeçalho
        let headerRow = -1;
        for (let i = 0; i < Math.min(data.length, 6); i++) {
          const row = data[i].map(c => String(c).toUpperCase());
          if (row.some(c => c.includes('EVENTO') || (c.includes('CÓD') && c.length < 20))) {
            headerRow = i;
            break;
          }
        }
        if (headerRow === -1) {
          alert('Cabeçalho não encontrado. Verifique se é o arquivo correto (aba "BD", coluna "CÓD. EVENTO").');
          return;
        }

        const headers = data[headerRow].map(h => String(h).trim().toUpperCase());

        // Índices das colunas
        const codIdx    = headers.findIndex(h => h.includes('CÓD') || (h.includes('COD') && h.includes('EVEN')));
        const nomeEvIdx = headers.findIndex(h => h.includes('NOME') && h.includes('EVENTO'));
        const debIdx    = headers.findIndex(h => h === 'DÉBITO' || h === 'DEBITO' || h.startsWith('DÉB'));
        const creIdx    = headers.findIndex(h => h === 'CRÉDITO' || h === 'CREDITO' || h.startsWith('CRÉ'));
        const regraIdx  = headers.findIndex(h => h.includes('REGRA'));

        // Primeira coluna "NOME CONTA CONTÁBIL" após DÉBITO, segunda após CRÉDITO
        let nomeDebIdx = -1, nomeCreIdx = -1;
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if (h.includes('NOME') && (h.includes('CONT') || h.includes('CTA'))) {
            if (nomeDebIdx === -1 && i > debIdx)  { nomeDebIdx = i; continue; }
            if (nomeCreIdx === -1 && i > creIdx)  { nomeCreIdx = i; continue; }
          }
        }
        if (nomeDebIdx === -1 && debIdx >= 0) nomeDebIdx = debIdx + 1;
        if (nomeCreIdx === -1 && creIdx >= 0) nomeCreIdx = creIdx + 1;

        // Montar array de linhas brutas
        const rows = [];
        for (let i = headerRow + 1; i < data.length; i++) {
          const row = data[i];
          const cod = String(row[codIdx] ?? '').trim();
          if (!cod || isNaN(Number(cod))) continue;

          rows.push({
            cod_evento:  cod,
            nome_evento: String(row[nomeEvIdx] ?? '').trim(),
            debito:      String(row[debIdx]    ?? '').trim(),
            nome_debito: String(row[nomeDebIdx]?? '').trim(),
            credito:     String(row[creIdx]    ?? '').trim(),
            nome_credito:String(row[nomeCreIdx]?? '').trim(),
            regra:       String(row[regraIdx]  ?? '').trim()
          });
        }

        if (rows.length === 0) {
          alert('Nenhuma linha de evento encontrada no arquivo.');
          return;
        }

        // Salvar e re-renderizar
        const params = Storage.getParams();
        params.contas_raw = rows;
        Storage.saveParams(params);
        App.render();

      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  },

};
