const Storage = {
  HISTORY_KEY: 'hob_historico',
  PARAMS_KEY: 'hob_parametros',

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '{}'); }
    catch { return {}; }
  },

  saveMonth(mesRef, data) {
    const h = this.getHistory();
    h[mesRef] = data;
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(h));
  },

  getMonth(mesRef) { return this.getHistory()[mesRef] || null; },

  getAllMonths() {
    const h = this.getHistory();
    return Object.keys(h).sort().reverse().map(k => h[k]);
  },

  deleteMonth(mesRef) {
    const h = this.getHistory();
    delete h[mesRef];
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(h));
  },

  getParams() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.PARAMS_KEY));
      return stored ? this.migrateParams(stored) : this.getDefaultParams();
    } catch { return this.getDefaultParams(); }
  },

  saveParams(params) {
    localStorage.setItem(this.PARAMS_KEY, JSON.stringify(params));
  },

  getDefaultParams() {
    return {
      // Contas contábeis por tipo de verba (usadas no PLC)
      contasContabeis: {
        PRO_LABORE: { debito: '6.1.1.01', nome_debito: 'CUSTO COM PRÓ-LABORE',        credito: '2.1.3.01', nome_credito: 'PRÓ-LABORE A PAGAR',         descricao: 'Pró-labore bruto' },
        DESCONTO:   { debito: '2.1.3.01', nome_debito: 'PRÓ-LABORE A PAGAR',          credito: '1.1.2.01', nome_credito: 'DESCONTOS A REALIZAR',        descricao: 'Desconto de benefícios' },
        SALARIO:    { debito: '6.1.1.05', nome_debito: 'CUSTO COM SALÁRIOS CLT',      credito: '2.1.3.06', nome_credito: 'SALÁRIOS A PAGAR',            descricao: 'Salário bruto CLT' },
        INSS:       { debito: '6.1.1.02', nome_debito: 'CUSTO INSS PATRONAL',         credito: '2.1.3.02', nome_credito: 'INSS A RECOLHER',             descricao: 'INSS' },
        IRRF:       { debito: '2.1.3.03', nome_debito: 'IRRF RETIDO',                 credito: '1.1.2.02', nome_credito: 'IRRF A RECOLHER',             descricao: 'IRRF' },
        FGTS:       { debito: '6.1.1.03', nome_debito: 'CUSTO FGTS',                  credito: '2.1.3.04', nome_credito: 'FGTS A RECOLHER',             descricao: 'FGTS' },
        BENEFICIO:  { debito: '6.1.1.04', nome_debito: 'CUSTO COM BENEFÍCIOS',        credito: '2.1.3.05', nome_credito: 'BENEFÍCIOS A PAGAR',          descricao: 'Benefícios' },
        OUTROS:     { debito: '6.1.1.99', nome_debito: 'OUTROS CUSTOS DE PESSOAL',    credito: '2.1.3.99', nome_credito: 'OUTROS A PAGAR',              descricao: 'Outros' }
      },
      // Parâmetros globais do PLC (campos fixos do layout SAP)
      plc_global: {
        projeto_financeiro:  '',   // ex: 005232
        regra_distribuicao:  '',   // ex: 4700
        departamento_padrao: '',   // ex: 1601  (código SAP de departamento)
        filial:              ''    // ex: HoB Associados em Consultoria e Treinamento Empresarial Ltda
      }
    };
  },

  // Migra parâmetros antigos (sem plc_global / sem nome_debito) para o formato novo
  migrateParams(stored) {
    const def = this.getDefaultParams();
    if (!stored.plc_global) stored.plc_global = def.plc_global;
    Object.keys(def.contasContabeis).forEach(k => {
      if (!stored.contasContabeis[k]) stored.contasContabeis[k] = def.contasContabeis[k];
      if (!stored.contasContabeis[k].nome_debito)  stored.contasContabeis[k].nome_debito  = def.contasContabeis[k].nome_debito;
      if (!stored.contasContabeis[k].nome_credito) stored.contasContabeis[k].nome_credito = def.contasContabeis[k].nome_credito;
    });
    return stored;
  }
};
