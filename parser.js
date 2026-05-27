const Parser = {
  parseNumber(v) {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    const cleaned = String(v).trim().replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  },

  norm(v) {
    if (v === null || v === undefined) return '';
    return String(v).trim();
  },

  async readWorkbook(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try { resolve(XLSX.read(e.target.result, { type: 'binary', cellDates: false })); }
        catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsBinaryString(file);
    });
  },

  sheetToObjects(sheet) {
    const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (arr.length < 2) return { headers: [], rows: [] };

    // Find header row: first row with 3+ string values longer than 2 chars
    let headerIdx = 0;
    for (let i = 0; i < Math.min(arr.length, 6); i++) {
      const cnt = arr[i].filter(c => typeof c === 'string' && c.trim().length > 2).length;
      if (cnt >= 3) { headerIdx = i; break; }
    }

    const headers = arr[headerIdx].map(h => this.norm(h)).filter(h => h);
    const rows = arr.slice(headerIdx + 1)
      .filter(row => row.some(c => c !== '' && c !== null && c !== undefined))
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
        return obj;
      });

    return { headers, rows };
  },

  findSheet(wb, ...nameParts) {
    const name = wb.SheetNames.find(n =>
      nameParts.some(p => n.toLowerCase().includes(p.toLowerCase()))
    );
    return wb.Sheets[name || wb.SheetNames[0]];
  },

  async parseInput01(file) {
    const errors = [];
    try {
      const wb = await this.readWorkbook(file);
      const { rows } = this.sheetToObjects(this.findSheet(wb, 'Remuneracao', 'Remun', 'Fixa'));
      const cpfSet = new Set();
      const data = [];

      rows.forEach((row, idx) => {
        const line = idx + 4;
        const id     = this.norm(row['ID_Pessoa']);
        const nome   = this.norm(row['Nome_Completo']);
        const cpf    = this.norm(row['CPF']);
        const vinc   = this.norm(row['Vinculo']).toUpperCase();
        const mes    = this.norm(row['Mes_Referencia']);
        const cc     = this.norm(row['Centro_Custo']);
        const bruto  = this.parseNumber(row['Pro_Labore_Bruto']);

        if (!id)   { errors.push(`Linha ${line}: ID_Pessoa obrigatório`); return; }
        if (!nome) { errors.push(`Linha ${line}: Nome_Completo obrigatório`); return; }
        if (!cpf)  { errors.push(`Linha ${line}: CPF obrigatório`); return; }
        if (!mes)  { errors.push(`Linha ${line}: Mes_Referencia obrigatório`); return; }

        if (!['ASSOCIADO', 'SOCIO'].includes(vinc))
          errors.push(`Linha ${line}: Vínculo inválido "${vinc}" (esperado: ASSOCIADO ou SOCIO)`);
        if (!/^\d{4}-\d{2}$/.test(mes))
          errors.push(`Linha ${line}: Mes_Referencia inválido "${mes}" (esperado: AAAA-MM)`);
        if (!cc)
          errors.push(`Linha ${line}: Centro_Custo obrigatório`);
        if (bruto <= 0)
          errors.push(`Linha ${line}: Pro_Labore_Bruto deve ser > 0`);
        if (cpfSet.has(cpf))
          errors.push(`Linha ${line}: CPF ${cpf} duplicado`);
        else cpfSet.add(cpf);

        data.push({
          id_pessoa: id, nome_completo: nome, cpf, vinculo: vinc,
          mes_referencia: mes, centro_custo: cc,
          pro_labore_bruto: bruto,
          adiantamento:     this.parseNumber(row['Adiantamento']),
          comissao:         this.parseNumber(row['Comissao']),
          outros_creditos:  this.parseNumber(row['Outros_Creditos']),
          observacao:       this.norm(row['Observacao'])
        });
      });

      const mesRef = data.length > 0 ? data[0].mes_referencia : null;
      return { data, errors, mesReferencia: mesRef };
    } catch (err) {
      return { data: [], errors: [`Erro ao ler arquivo: ${err.message}`], mesReferencia: null };
    }
  },

  async parseInput02(file) {
    const errors = [];
    try {
      const wb = await this.readWorkbook(file);
      const { rows } = this.sheetToObjects(this.findSheet(wb, 'Organograma', 'Org'));
      const idSet = new Set(), cpfSet = new Set();
      const data = [];

      rows.forEach((row, idx) => {
        const line = idx + 4;
        const id   = this.norm(row['ID_Pessoa']);
        const nome = this.norm(row['Nome_Completo']);
        const cpf  = this.norm(row['CPF']);
        const vinc = this.norm(row['Vinculo']).toUpperCase();
        const stat = this.norm(row['Status']).toUpperCase();

        if (!id)   { errors.push(`Linha ${line}: ID_Pessoa obrigatório`); return; }
        if (!nome) { errors.push(`Linha ${line}: Nome_Completo obrigatório`); return; }
        if (!cpf)  { errors.push(`Linha ${line}: CPF obrigatório`); return; }

        if (!['CLT', 'ASSOCIADO', 'SOCIO'].includes(vinc))
          errors.push(`Linha ${line}: Vínculo inválido "${vinc}" (esperado: CLT, ASSOCIADO ou SOCIO)`);
        if (!['ATIVO', 'INATIVO'].includes(stat))
          errors.push(`Linha ${line}: Status inválido "${stat}" (esperado: ATIVO ou INATIVO)`);
        if (idSet.has(id))
          errors.push(`Linha ${line}: ID_Pessoa "${id}" duplicado`);
        else idSet.add(id);
        if (cpfSet.has(cpf))
          errors.push(`Linha ${line}: CPF ${cpf} duplicado`);
        else cpfSet.add(cpf);

        data.push({
          id_pessoa: id, nome_completo: nome, cpf, vinculo: vinc,
          diretoria:    this.norm(row['Diretoria']),
          gerencia:     this.norm(row['Gerencia']),
          area:         this.norm(row['Area']),
          centro_custo: this.norm(row['Centro_Custo']),
          cargo:        this.norm(row['Cargo']),
          data_admissao:this.norm(row['Data_Admissao']),
          status: stat,
          gestor_direto:this.norm(row['Gestor_Direto'])
        });
      });

      return { data, errors };
    } catch (err) {
      return { data: [], errors: [`Erro ao ler arquivo: ${err.message}`] };
    }
  },

  async parseInput03(file) {
    const errors = [];
    try {
      const wb = await this.readWorkbook(file);
      const { rows } = this.sheetToObjects(this.findSheet(wb, 'Desconto', 'Beneficio'));
      const data = [];

      rows.forEach((row, idx) => {
        const line  = idx + 4;
        const id    = this.norm(row['ID_Pessoa']);
        const nome  = this.norm(row['Nome_Completo']);
        const cpf   = this.norm(row['CPF']);
        const mes   = this.norm(row['Mes_Referencia']);
        const total = this.parseNumber(row['Total_Descontos']);

        if (!id)  { errors.push(`Linha ${line}: ID_Pessoa obrigatório`); return; }
        if (!nome){ errors.push(`Linha ${line}: Nome_Completo obrigatório`); return; }
        if (!cpf) { errors.push(`Linha ${line}: CPF obrigatório`); return; }
        if (!mes) { errors.push(`Linha ${line}: Mes_Referencia obrigatório`); return; }
        if (total < 0) errors.push(`Linha ${line}: Total_Descontos não pode ser negativo`);

        const ps = this.parseNumber(row['Plano_Saude']);
        const pd = this.parseNumber(row['Plano_Dental']);
        const vv = this.parseNumber(row['VR_VT_Desconto']);
        const sv = this.parseNumber(row['Seguro_Vida']);
        const od = this.parseNumber(row['Outros_Descontos']);
        [['Plano_Saude', ps],['Plano_Dental', pd],['VR_VT_Desconto', vv],['Seguro_Vida', sv],['Outros_Descontos', od]]
          .forEach(([c, v]) => { if (v < 0) errors.push(`Linha ${line}: ${c} não pode ser negativo`); });

        data.push({
          id_pessoa: id, nome_completo: nome, cpf, mes_referencia: mes,
          plano_saude: ps, plano_dental: pd, vr_vt_desconto: vv,
          seguro_vida: sv, outros_descontos: od, total_descontos: total,
          observacao: this.norm(row['Observacao'])
        });
      });

      return { data, errors, mesReferencia: data.length > 0 ? data[0].mes_referencia : null };
    } catch (err) {
      return { data: [], errors: [`Erro ao ler arquivo: ${err.message}`], mesReferencia: null };
    }
  },

  async parseInput04(file) {
    const errors = [];
    try {
      const wb = await this.readWorkbook(file);
      const { rows } = this.sheetToObjects(this.findSheet(wb, 'Folha', 'DP'));
      const data = [];

      rows.forEach((row, idx) => {
        const line   = idx + 4;
        const id     = this.norm(row['ID_Pessoa']);
        const nome   = this.norm(row['Nome_Completo']);
        const cpf    = this.norm(row['CPF']);
        const vinc   = this.norm(row['Vinculo']).toUpperCase();
        const mes    = this.norm(row['Mes_Referencia']);
        const cc     = this.norm(row['Centro_Custo']);
        const bruto  = this.parseNumber(row['Salario_Bruto']);
        const liquido= this.parseNumber(row['Salario_Liquido']);
        const banco  = this.norm(row['Num_Banco']);
        const agencia= this.norm(row['Agencia']);
        const conta  = this.norm(row['Conta']);

        if (!id)  { errors.push(`Linha ${line}: ID_Pessoa obrigatório`); return; }
        if (!cpf) { errors.push(`Linha ${line}: CPF obrigatório`); return; }
        if (!mes) { errors.push(`Linha ${line}: Mes_Referencia obrigatório`); return; }
        if (!cc)  errors.push(`Linha ${line}: Centro_Custo obrigatório`);
        if (bruto <= 0) errors.push(`Linha ${line}: Salario_Bruto deve ser > 0`);
        if (!banco)  errors.push(`Linha ${line}: Num_Banco obrigatório`);
        if (!agencia)errors.push(`Linha ${line}: Agencia obrigatória`);
        if (!conta)  errors.push(`Linha ${line}: Conta obrigatória`);

        data.push({
          id_pessoa: id, nome_completo: nome, cpf, vinculo: vinc,
          mes_referencia: mes, centro_custo: cc,
          salario_bruto:    bruto,
          inss:             this.parseNumber(row['INSS']),
          irrf:             this.parseNumber(row['IRRF']),
          fgts:             this.parseNumber(row['FGTS']),
          vale_transporte:  this.parseNumber(row['Vale_Transporte']),
          vale_refeicao:    this.parseNumber(row['Vale_Refeicao']),
          outros_descontos: this.parseNumber(row['Outros_Descontos']),
          salario_liquido: liquido,
          num_banco: banco, agencia, conta,
          observacao: this.norm(row['Observacao'])
        });
      });

      return { data, errors, mesReferencia: data.length > 0 ? data[0].mes_referencia : null };
    } catch (err) {
      return { data: [], errors: [`Erro ao ler arquivo: ${err.message}`], mesReferencia: null };
    }
  }
};
