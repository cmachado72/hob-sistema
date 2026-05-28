const Exporter = {
  today() { return new Date().toISOString().split('T')[0]; },

  monthLabel(mesRef) {
    if (!mesRef) return '';
    const [y, m] = mesRef.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${months[parseInt(m, 10) - 1]}/${y}`;
  },

  colWidths(ws, widths) {
    ws['!cols'] = widths.map(w => ({ wch: w }));
  },

  // Freeze first row (header) for readability
  freezeHeader(ws) {
    ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };
  },

  generateOutput01(processedData, mesRef) {
    const { pessoasAssocSocio } = processedData;
    const today = this.today();

    const headers = [
      'Mes_Referencia','ID_Pessoa','Nome_Completo','CPF','Vinculo',
      'Centro_Custo','Pro_Labore_Bruto','Total_Descontos','Valor_Liquido',
      'Num_Banco','Agencia','Conta','Data_Pagamento','Status_SAP','Observacao'
    ];

    const rows = pessoasAssocSocio.map(p => [
      p.mes_referencia, p.id_pessoa, p.nome_completo, p.cpf, p.vinculo,
      p.centro_custo,
      p.pro_labore_bruto, p.total_descontos, p.valor_liquido,
      p.num_banco, p.agencia, p.conta,
      today, 'PENDENTE', p.observacao || ''
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    this.colWidths(ws, [14,10,30,16,12,12,16,16,14,10,10,12,14,12,24]);
    this.freezeHeader(ws);
    XLSX.utils.book_append_sheet(wb, ws, 'Pagamentos_SAP');
    XLSX.writeFile(wb, `HOB_Pagamentos_${mesRef}.xlsx`);
  },

  // Colunas conforme Modelo PLC.xlsx (layout SAP)
  PLC_HEADERS: [
    'Cta.contáb./cód.PN',
    'Cta.cont./Nome PN',
    'Débito',
    'Crédito',
    'Projeto Financeiro',
    'Código PN',
    'Código PN',
    'Observações',
    'Regra distr.',
    'Área',
    'Departamento',
    'Ref. 3',
    'Filial'
  ],

  // Mapeamento tipo_verba → códigos de evento no arquivo HOB_Contas (primeira correspondência vence)
  TIPO_EVENTS: {
    SALARIO:   ['1'],
    INSS:      ['30335', '11'],
    IRRF:      ['13'],
    FGTS:      ['30334'],
    BENEFICIO: ['109', '143', '1049']
  },

  // Constrói mapa tipo → linha de conta a partir das linhas brutas importadas
  _buildContaMap(contas_raw) {
    const byCode = {};
    (contas_raw || []).forEach(r => { byCode[String(r.cod_evento).trim()] = r; });
    const map = {};
    for (const [tipo, codes] of Object.entries(this.TIPO_EVENTS)) {
      for (const cod of codes) {
        if (byCode[String(cod)]) { map[tipo] = byCode[String(cod)]; break; }
      }
    }
    return map;
  },

  generateOutput02(processedData, mesRef, params) {
    const { todasPessoas } = processedData;
    const label    = this.monthLabel(mesRef);
    const contaMap = this._buildContaMap(params.contas_raw);
    const g        = params.plc_global || {};

    const projFin = g.projeto_financeiro  || '';
    const regra   = g.regra_distribuicao  || '';
    const dept    = g.departamento_padrao || '';
    const filial  = g.filial              || '';

    const rows = [];

    // Cada verba gera 2 linhas: 1 débito + 1 crédito (partidas dobradas)
    const addEntry = (p, tipo, valor, obs) => {
      if (!valor || valor === 0) return;
      const c = contaMap[tipo];
      if (!c) return; // tipo sem conta configurada → linha omitida
      const cpf = (p.cpf || '').replace(/\D/g, '');
      const cc  = p.centro_custo || '';

      // Linha de DÉBITO
      rows.push([
        c.debito, c.nome_debito,
        valor, '',
        projFin, cpf, p.nome_completo, obs,
        regra, cc, dept, p.id_pessoa, filial
      ]);

      // Linha de CRÉDITO
      rows.push([
        c.credito, c.nome_credito,
        '', valor,
        projFin, cpf, p.nome_completo, obs,
        regra, cc, dept, p.id_pessoa, filial
      ]);
    };

    todasPessoas.forEach(p => {
      if (p.vinculo === 'CLT') {
        addEntry(p, 'SALARIO',  p.salario_bruto,    `Salário Bruto ${label}`);
        addEntry(p, 'INSS',     p.inss,             `INSS ${label}`);
        addEntry(p, 'IRRF',     p.irrf,             `IRRF ${label}`);
        addEntry(p, 'FGTS',     p.fgts,             `FGTS ${label}`);
        addEntry(p, 'BENEFICIO',p.vale_transporte,  `Vale Transporte ${label}`);
        addEntry(p, 'BENEFICIO',p.vale_refeicao,    `Vale Refeição ${label}`);
        addEntry(p, 'BENEFICIO',p.outros_descontos, `Outros Descontos ${label}`);
      } else {
        addEntry(p, 'PRO_LABORE', p.pro_labore_bruto,           `Pro-labore ${label}`);
        addEntry(p, 'DESCONTO',   p.total_descontos_beneficios, `Descontos Benefícios ${label}`);
        addEntry(p, 'OUTROS',     p.comissao,                   `Comissão ${label}`);
        addEntry(p, 'OUTROS',     p.outros_creditos,            `Outros Créditos ${label}`);
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([this.PLC_HEADERS, ...rows]);
    this.colWidths(ws, [18,36,14,14,18,16,32,42,12,14,14,14,48]);
    this.freezeHeader(ws);
    XLSX.utils.book_append_sheet(wb, ws, 'PLC_SAP');
    XLSX.writeFile(wb, `HOB_PLC_${mesRef}.xlsx`);
  },

  // Re-export from stored history data
  reexportOutput01(monthRecord) {
    const { mesReferencia: mesRef, pessoas: pessoasAssocSocio } = monthRecord;
    const today = this.today();
    const headers = [
      'Mes_Referencia','ID_Pessoa','Nome_Completo','CPF','Vinculo',
      'Centro_Custo','Pro_Labore_Bruto','Total_Descontos','Valor_Liquido',
      'Num_Banco','Agencia','Conta','Data_Pagamento','Status_SAP','Observacao'
    ];
    const rows = pessoasAssocSocio.map(p => [
      mesRef, p.id_pessoa, p.nome_completo || p.nome, p.cpf, p.vinculo,
      p.centro_custo, p.pro_labore_bruto, p.total_descontos, p.valor_liquido,
      p.num_banco || '', p.agencia || '', p.conta || '',
      today, 'PENDENTE', p.observacao || ''
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    this.colWidths(ws, [14,10,30,16,12,12,16,16,14,10,10,12,14,12,24]);
    XLSX.utils.book_append_sheet(wb, ws, 'Pagamentos_SAP');
    XLSX.writeFile(wb, `HOB_Pagamentos_${mesRef}_reexport.xlsx`);
  },

  reexportOutput02(monthRecord) {
    if (!monthRecord.todasPessoas) {
      alert('Dados completos não disponíveis para re-exportação do PLC deste mês.');
      return;
    }
    this.generateOutput02(
      { todasPessoas: monthRecord.todasPessoas },
      monthRecord.mesReferencia,
      Storage.getParams()
    );
  },

  // Template generators (in-browser, no styling needed)
  generateTemplate(type) {
    const builders = {
      input01: () => this._tplInput01(),
      input02: () => this._tplInput02(),
      input03: () => this._tplInput03(),
      input04: () => this._tplInput04(),
      output01:() => this._tplOutput01(),
      output02:() => this._tplOutput02()
    };
    if (builders[type]) builders[type]();
  },

  _tpl(title, sub, cols, example, filename, sheetName, widths) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[title],[sub],cols,example]);
    if (widths) this.colWidths(ws, widths);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  },

  _tplInput01() {
    this._tpl(
      'HOB — Input: Remuneração Fixa | Kapital Humano',
      'Campos obrigatórios: ID_Pessoa, Nome_Completo, CPF, Vinculo (ASSOCIADO ou SOCIO), Mes_Referencia (AAAA-MM), Centro_Custo, Pro_Labore_Bruto',
      ['ID_Pessoa','Nome_Completo','CPF','Vinculo','Mes_Referencia','Centro_Custo','Pro_Labore_Bruto','Adiantamento','Comissao','Outros_Creditos','Observacao'],
      ['001','Ana Paula Souza','123.456.789-00','ASSOCIADO','2026-04','FIN-001','15000.00','5000.00','','',''],
      'INPUT_01_Remuneracao_Fixa_KH.xlsx', 'Remuneracao_Fixa',
      [10,30,16,12,14,12,16,14,12,14,24]
    );
  },

  _tplInput02() {
    this._tpl(
      'HOB — Input: Organograma | Kapital Humano',
      'Campos obrigatórios: ID_Pessoa, Nome_Completo, CPF, Vinculo (CLT/ASSOCIADO/SOCIO), Diretoria, Gerencia, Area, Centro_Custo, Cargo, Data_Admissao (AAAA-MM-DD), Status (ATIVO/INATIVO)',
      ['ID_Pessoa','Nome_Completo','CPF','Vinculo','Diretoria','Gerencia','Area','Centro_Custo','Cargo','Data_Admissao','Status','Gestor_Direto'],
      ['001','Ana Paula Souza','123.456.789-00','ASSOCIADO','Diretoria Financeira','Gerência de Controladoria','Backoffice','FIN-001','Analista Sênior','2022-03-01','ATIVO','Carlos Lima'],
      'INPUT_02_Organograma_KH.xlsx', 'Organograma',
      [10,30,16,12,24,28,20,12,22,14,8,24]
    );
  },

  _tplInput03() {
    this._tpl(
      'HOB — Input: Descontos de Benefícios | Área de Benefícios',
      'Campos obrigatórios: ID_Pessoa, Nome_Completo, CPF, Mes_Referencia (AAAA-MM), Total_Descontos. Valores individuais são opcionais.',
      ['ID_Pessoa','Nome_Completo','CPF','Mes_Referencia','Plano_Saude','Plano_Dental','VR_VT_Desconto','Seguro_Vida','Outros_Descontos','Total_Descontos','Observacao'],
      ['001','Ana Paula Souza','123.456.789-00','2026-04','850.00','120.00','','45.00','','1015.00',''],
      'INPUT_03_Descontos_Beneficios.xlsx', 'Descontos_Beneficios',
      [10,30,16,14,14,14,14,14,16,16,24]
    );
  },

  _tplInput04() {
    this._tpl(
      'HOB — Input: Arquivo de Folha | Departamento Pessoal (DP)',
      'Campos obrigatórios: ID_Pessoa, CPF, Vinculo, Mes_Referencia (AAAA-MM), Centro_Custo, Salario_Bruto, Num_Banco, Agencia, Conta',
      ['ID_Pessoa','Nome_Completo','CPF','Vinculo','Mes_Referencia','Centro_Custo','Salario_Bruto','INSS','IRRF','FGTS','Vale_Transporte','Vale_Refeicao','Outros_Descontos','Salario_Liquido','Num_Banco','Agencia','Conta','Observacao'],
      ['002','Bruno Cardoso','987.654.321-00','CLT','2026-04','MKT-002','8000.00','880.00','427.00','640.00','250.00','','','5803.00','001','1234-5','98765-4',''],
      'INPUT_04_Folha_DP.xlsx', 'Folha_DP',
      [10,30,16,12,14,12,14,10,10,10,14,14,16,14,10,10,12,24]
    );
  },

  _tplOutput01() {
    this._tpl(
      'HOB — OUTPUT: Planilha de Pagamentos | Upload SAP',
      'Gerado automaticamente. Associados e Sócios apenas.',
      ['Mes_Referencia','ID_Pessoa','Nome_Completo','CPF','Vinculo','Centro_Custo','Pro_Labore_Bruto','Total_Descontos','Valor_Liquido','Num_Banco','Agencia','Conta','Data_Pagamento','Status_SAP','Observacao'],
      [],
      'OUTPUT_01_Pagamentos_SAP_template.xlsx', 'Pagamentos_SAP',
      [14,10,30,16,12,12,16,16,14,10,10,12,14,12,24]
    );
  },

  _tplOutput02() {
    this._tpl(
      'HOB — OUTPUT: Pré-Lançamentos Contábeis (PLC) | Upload SAP',
      'Gerado automaticamente. 2 linhas por verba (débito + crédito). Cobre CLTs + Associados + Sócios.',
      this.PLC_HEADERS,
      [],
      'OUTPUT_02_PLC_template.xlsx', 'PLC_SAP',
      [18,36,14,14,18,16,32,42,12,14,14,14,48]
    );
  }
};
