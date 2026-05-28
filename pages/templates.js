const TemplatesPage = {
  templates: [
    {
      key: 'input01', type: 'INPUT', num: '01', icon: '💰',
      label: 'Remuneração Fixa',
      area: 'Kapital Humano',
      desc: 'Pró-labore bruto, adiantamento, comissão e outros créditos de Associados e Sócios.',
      campos: ['ID_Pessoa*','Nome_Completo*','CPF*','Vinculo* (ASSOCIADO/SOCIO)','Mes_Referencia* (AAAA-MM)','Centro_Custo*','Pro_Labore_Bruto*','Adiantamento','Comissao','Outros_Creditos','Observacao'],
      color: 'border-emerald-200 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    {
      key: 'input02', type: 'INPUT', num: '02', icon: '🏢',
      label: 'Organograma',
      area: 'Kapital Humano',
      desc: 'Base completa de pessoas (CLT, Associados e Sócios). Atualizar mensalmente.',
      campos: ['ID_Pessoa*','Nome_Completo*','CPF*','Vinculo* (CLT/ASSOCIADO/SOCIO)','Diretoria*','Gerencia*','Area*','Centro_Custo*','Cargo*','Data_Admissao* (AAAA-MM-DD)','Status* (ATIVO/INATIVO)','Gestor_Direto'],
      color: 'border-blue-200 bg-blue-50',
      badge: 'bg-blue-100 text-blue-700'
    },
    {
      key: 'input03', type: 'INPUT', num: '03', icon: '🏥',
      label: 'Descontos e Benefícios',
      area: 'Área de Benefícios',
      desc: 'Descontos a aplicar: plano de saúde, dental, VR/VT, seguro de vida e outros.',
      campos: ['ID_Pessoa*','Nome_Completo*','CPF*','Mes_Referencia* (AAAA-MM)','Plano_Saude','Plano_Dental','VR_VT_Desconto','Seguro_Vida','Outros_Descontos','Total_Descontos*','Observacao'],
      color: 'border-rose-200 bg-rose-50',
      badge: 'bg-rose-100 text-rose-700'
    },
    {
      key: 'input04', type: 'INPUT', num: '04', icon: '📑',
      label: 'Arquivo de Folha (DP)',
      area: 'Departamento Pessoal',
      desc: 'Folha exportada após envio ao banco. Inclui todos os vínculos com dados bancários.',
      campos: ['ID_Pessoa*','Nome_Completo','CPF*','Vinculo*','Mes_Referencia* (AAAA-MM)','Centro_Custo*','Salario_Bruto*','INSS','IRRF','FGTS','Vale_Transporte','Vale_Refeicao','Outros_Descontos','Salario_Liquido*','Num_Banco*','Agencia*','Conta*','Observacao'],
      color: 'border-orange-200 bg-orange-50',
      badge: 'bg-orange-100 text-orange-700'
    },
    {
      key: 'output01', type: 'OUTPUT', num: '01', icon: '💳',
      label: 'Pagamentos SAP',
      area: 'Backoffice',
      desc: 'Planilha de pagamentos gerada automaticamente. Apenas Associados e Sócios.',
      campos: ['Mes_Referencia','ID_Pessoa','Nome_Completo','CPF','Vinculo','Centro_Custo','Pro_Labore_Bruto','Total_Descontos','Valor_Liquido','Num_Banco','Agencia','Conta','Data_Pagamento','Status_SAP','Observacao'],
      color: 'border-slate-200 bg-slate-50',
      badge: 'bg-slate-100 text-slate-600'
    },
    {
      key: 'output02', type: 'OUTPUT', num: '02', icon: '📊',
      label: 'Pré-Lançamentos Contábeis (PLC)',
      area: 'Backoffice',
      desc: 'Layout SAP (Modelo PLC). 2 linhas por verba (débito + crédito). Cobre CLTs + Associados + Sócios.',
      campos: ['Cta.contáb./cód.PN','Cta.cont./Nome PN','Débito','Crédito','Projeto Financeiro','Código PN (CPF)','Código PN (Nome)','Observações','Regra distr.','Área','Departamento','Ref. 3','Filial'],
      color: 'border-slate-200 bg-slate-50',
      badge: 'bg-slate-100 text-slate-600'
    }
  ],

  renderCard(t) {
    const campos = t.campos.map(c => {
      const obrig = c.endsWith('*');
      const label = c.replace('*', '');
      return `<span class="text-xs px-1.5 py-0.5 rounded-full ${obrig ? 'bg-yellow-100 text-yellow-800 font-medium border border-yellow-200' : 'bg-white border border-slate-200 text-slate-500'}">${label}</span>`;
    }).join('');

    return `
      <div class="rounded-xl border-2 ${t.color} p-5">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${t.icon}</span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold uppercase tracking-wide ${t.badge} px-2 py-0.5 rounded-full">${t.type} ${t.num}</span>
                <span class="font-semibold text-gray-800 text-sm">${t.label}</span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">${t.area}</div>
            </div>
          </div>
          <button onclick="Exporter.generateTemplate('${t.key}')"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Baixar .xlsx
          </button>
        </div>
        <p class="text-xs text-gray-600 mb-3">${t.desc}</p>
        <details>
          <summary class="text-xs text-gray-400 hover:text-gray-600 select-none cursor-pointer">Ver colunas (${t.campos.length})</summary>
          <div class="mt-2 flex flex-wrap gap-1.5">${campos}</div>
          ${t.campos.some(c => c.endsWith('*')) ? '<p class="text-xs text-yellow-600 mt-2">* Campo obrigatório</p>' : ''}
        </details>
      </div>`;
  },

  render() {
    const inputs  = this.templates.slice(0, 4);
    const outputs = this.templates.slice(4);

    return `
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Templates</h1>
          <p class="text-sm text-gray-500 mt-1">Baixe as planilhas modelo para enviar às áreas responsáveis.</p>
        </div>

        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex gap-3">
          <span class="text-blue-500 text-base mt-0.5 shrink-0 font-bold">ℹ</span>
          <p class="text-sm text-blue-700">
            Cada planilha inclui uma linha de exemplo. Substitua-a pelos dados reais antes de fazer o upload.
            Mantenha os nomes das colunas intactos e respeite os formatos indicados.
          </p>
        </div>

        <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Inputs — preenchidos pelas áreas</h2>
        <div class="grid grid-cols-2 gap-4 mb-8">
          ${inputs.map(t => this.renderCard(t)).join('')}
        </div>

        <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Outputs — gerados pelo sistema (referência)</h2>
        <div class="grid grid-cols-2 gap-4">
          ${outputs.map(t => this.renderCard(t)).join('')}
        </div>
      </div>`;
  },

  init() {}
};
