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
      // Contas contábeis por tipo de verba (usadas no PLC).
      // Valores em branco: devem ser preenchidos via importação do arquivo HOB_Contas
      // ou manualmente na tela de Parâmetros.
      contasContabeis: {
        PRO_LABORE: { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'Pró-labore bruto' },
        DESCONTO:   { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'Desconto de benefícios' },
        SALARIO:    { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'Salário bruto CLT' },
        INSS:       { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'INSS' },
        IRRF:       { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'IRRF' },
        FGTS:       { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'FGTS' },
        BENEFICIO:  { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'Benefícios' },
        OUTROS:     { debito: '', nome_debito: '', credito: '', nome_credito: '', descricao: 'Outros' }
      },
      // Parâmetros globais do PLC (campos fixos do layout SAP)
      plc_global: {
        projeto_financeiro:  '',
        regra_distribuicao:  '',
        departamento_padrao: '',
        filial:              ''
      }
    };
  },

  // Migra parâmetros de versões anteriores: garante estrutura, sem sobrescrever valores salvos
  migrateParams(stored) {
    const def = this.getDefaultParams();
    if (!stored.plc_global) stored.plc_global = def.plc_global;
    Object.keys(def.contasContabeis).forEach(k => {
      if (!stored.contasContabeis[k]) stored.contasContabeis[k] = { ...def.contasContabeis[k] };
      if (stored.contasContabeis[k].nome_debito  === undefined) stored.contasContabeis[k].nome_debito  = '';
      if (stored.contasContabeis[k].nome_credito === undefined) stored.contasContabeis[k].nome_credito = '';
    });
    return stored;
  }
};
