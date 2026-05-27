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
      return stored || this.getDefaultParams();
    } catch { return this.getDefaultParams(); }
  },

  saveParams(params) {
    localStorage.setItem(this.PARAMS_KEY, JSON.stringify(params));
  },

  getDefaultParams() {
    return {
      contasContabeis: {
        PRO_LABORE: { debito: '6.1.1.01', credito: '2.1.3.01', descricao: 'Pró-labore bruto' },
        DESCONTO:   { debito: '2.1.3.01', credito: '1.1.2.01', descricao: 'Desconto de benefícios' },
        SALARIO:    { debito: '6.1.1.05', credito: '2.1.3.06', descricao: 'Salário bruto CLT' },
        INSS:       { debito: '6.1.1.02', credito: '2.1.3.02', descricao: 'INSS' },
        IRRF:       { debito: '2.1.3.03', credito: '1.1.2.02', descricao: 'IRRF' },
        FGTS:       { debito: '6.1.1.03', credito: '2.1.3.04', descricao: 'FGTS' },
        BENEFICIO:  { debito: '6.1.1.04', credito: '2.1.3.05', descricao: 'Benefícios' },
        OUTROS:     { debito: '6.1.1.99', credito: '2.1.3.99', descricao: 'Outros' }
      }
    };
  }
};
