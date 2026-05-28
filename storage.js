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
      // Linhas brutas do arquivo HOB_Contas para Integração_Fopag_AAAA.xlsx
      // null = arquivo ainda não carregado
      contas_raw: null,

      // Parâmetros globais do PLC (campos fixos do layout SAP, não constam no arquivo)
      plc_global: {
        projeto_financeiro:  '',
        regra_distribuicao:  '',
        departamento_padrao: '',
        filial:              ''
      }
    };
  },

  // Migra params de versões anteriores para o novo formato
  migrateParams(stored) {
    const def = this.getDefaultParams();

    // Garante plc_global e seus campos
    if (!stored.plc_global) stored.plc_global = { ...def.plc_global };
    ['projeto_financeiro', 'regra_distribuicao', 'departamento_padrao', 'filial'].forEach(k => {
      if (stored.plc_global[k] === undefined) stored.plc_global[k] = '';
    });

    // Garante contas_raw (versões antigas tinham contasContabeis — descartado)
    if (stored.contas_raw === undefined) stored.contas_raw = null;

    return stored;
  }
};
