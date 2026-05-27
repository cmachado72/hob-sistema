const Engine = {
  process(p1, p2, p3, p4) {
    const errors = [];
    const alertas = [];

    // Cross-check 1: mês de referência consistente entre inputs com Mes_Referencia
    const meses = [p1.mesReferencia, p3.mesReferencia, p4.mesReferencia].filter(Boolean);
    const mesUnicos = [...new Set(meses)];
    if (mesUnicos.length > 1)
      errors.push(`Inconsistência de mês: inputs com meses diferentes (${mesUnicos.join(', ')})`);
    const mesReferencia = mesUnicos[0] || '';

    // Build lookup maps
    const orgMap  = {};
    p2.data.forEach(p => { orgMap[p.id_pessoa] = p; });

    const descMap = {};
    p3.data.forEach(d => { descMap[d.id_pessoa] = d; });

    const dpMap = {};
    p4.data.forEach(d => { dpMap[d.id_pessoa] = d; });

    // Cross-check 2: toda pessoa do INPUT_01 deve existir no organograma
    p1.data.forEach(p => {
      if (!orgMap[p.id_pessoa])
        errors.push(`${p.nome_completo} (${p.id_pessoa}) está no INPUT_01 mas não existe no Organograma`);
    });

    // Cross-check 3: toda pessoa do INPUT_03 deve existir no organograma
    p3.data.forEach(d => {
      if (!orgMap[d.id_pessoa])
        alertas.push({ tipo: 'PESSOA_SEM_ORG', id: d.id_pessoa, nome: d.nome_completo,
          msg: `${d.nome_completo} está no INPUT_03 mas não existe no Organograma` });
    });

    // Processar Associados e Sócios (INPUT_01)
    const pessoasAssocSocio = p1.data.map(p => {
      const org      = orgMap[p.id_pessoa] || {};
      const desc     = descMap[p.id_pessoa] || { total_descontos: 0 };
      const dp       = dpMap[p.id_pessoa]   || {};

      // Cross-check 4: dados bancários
      if (!dp.num_banco) {
        alertas.push({ tipo: 'SEM_DADOS_BANCARIOS', id: p.id_pessoa, nome: p.nome_completo,
          msg: `${p.nome_completo}: sem dados bancários no INPUT_04` });
      } else if (!dp.agencia || !dp.conta) {
        alertas.push({ tipo: 'DADOS_BANCARIOS_INCOMPLETOS', id: p.id_pessoa, nome: p.nome_completo,
          msg: `${p.nome_completo}: dados bancários incompletos` });
      }

      // Inconsistência de centro de custo
      if (org.centro_custo && p.centro_custo && org.centro_custo !== p.centro_custo) {
        alertas.push({ tipo: 'CC_INCONSISTENTE', id: p.id_pessoa, nome: p.nome_completo,
          msg: `${p.nome_completo}: CC divergente — INPUT_01: ${p.centro_custo} / Org: ${org.centro_custo}` });
      }

      // Cálculo: Valor_Liquido
      const valor_liquido = p.pro_labore_bruto
        + p.adiantamento
        + p.comissao
        + p.outros_creditos
        - desc.total_descontos;

      // Cross-check 5: valor líquido positivo
      if (valor_liquido <= 0) {
        alertas.push({ tipo: 'VALOR_LIQUIDO_NEGATIVO', id: p.id_pessoa, nome: p.nome_completo,
          msg: `${p.nome_completo}: valor líquido R$ ${valor_liquido.toFixed(2)} ≤ 0 — CRÍTICO` });
      }

      return {
        id_pessoa: p.id_pessoa,
        nome_completo: p.nome_completo,
        cpf: p.cpf,
        vinculo: p.vinculo,
        mes_referencia: p.mes_referencia,
        centro_custo: org.centro_custo || p.centro_custo,
        area: org.area || '',
        diretoria: org.diretoria || '',
        pro_labore_bruto: p.pro_labore_bruto,
        adiantamento: p.adiantamento,
        comissao: p.comissao,
        outros_creditos: p.outros_creditos,
        total_descontos: desc.total_descontos,
        valor_liquido,
        num_banco: dp.num_banco || '',
        agencia: dp.agencia || '',
        conta: dp.conta || '',
        observacao: p.observacao
      };
    });

    // Todas as pessoas do INPUT_04 (CLT + Assoc + Sócio) para o PLC
    const todasPessoas = p4.data.map(d => {
      const org = orgMap[d.id_pessoa] || {};
      const desc = descMap[d.id_pessoa] || {};
      return {
        ...d,
        area: org.area || '',
        diretoria: org.diretoria || '',
        centro_custo: org.centro_custo || d.centro_custo,
        total_descontos_beneficios: desc.total_descontos || 0,
        // For Assoc/Sócio, also bring INPUT_01 fields
        ...(() => {
          const p1rec = p1.data.find(p => p.id_pessoa === d.id_pessoa);
          return p1rec ? {
            pro_labore_bruto: p1rec.pro_labore_bruto,
            adiantamento: p1rec.adiantamento,
            comissao: p1rec.comissao,
            outros_creditos: p1rec.outros_creditos
          } : {};
        })()
      };
    });

    const totalClt        = todasPessoas.filter(p => p.vinculo === 'CLT').length;
    const totalAssociados = pessoasAssocSocio.filter(p => p.vinculo === 'ASSOCIADO').length;
    const totalSocios     = pessoasAssocSocio.filter(p => p.vinculo === 'SOCIO').length;
    const totalBruto      = pessoasAssocSocio.reduce((s, p) => s + p.pro_labore_bruto, 0);
    const totalDescontos  = pessoasAssocSocio.reduce((s, p) => s + p.total_descontos, 0);
    const totalLiquido    = pessoasAssocSocio.reduce((s, p) => s + p.valor_liquido, 0);

    return {
      mesReferencia,
      errors,
      alertas,
      pessoasAssocSocio,
      todasPessoas,
      resumo: {
        total_pessoas: totalClt + totalAssociados + totalSocios,
        total_clt: totalClt,
        total_associados: totalAssociados,
        total_socios: totalSocios,
        total_bruto: totalBruto,
        total_descontos: totalDescontos,
        total_liquido: totalLiquido
      }
    };
  }
};
