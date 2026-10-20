/* Prescrições de plantão · fase 2 (dengue, constipação, pele, parasitoses, olhos, ouvido, acidentes, cólica, boca).
   Doses da ficha pesquisa/prescricoes/ficha_codex_fase2.md (resumos-pediatria), conferida por conferir_citacoes.py
   (177 números com lastro) e por amostragem. Usa AP e ANTITERMICOS de prescricoes-dados.js.
   Extensões: dose.mgDoseFn(ctx) devolve mg por tomada; situação.orientacoes substitui as orientações gerais na cópia. */
"use strict";

Object.assign(window.FONTES_PRESC, {
  "MS-DENGUE": "Ministério da Saúde. Dengue: diagnóstico e manejo clínico, adulto e criança, 6ª ed., 2024.",
  "SBP-CONST": "SBP. Constipação intestinal, 2024.",
  "ESPGHAN-C": "ESPGHAN/NASPGHAN. Constipação funcional em crianças, 2014.",
  "ASBAI-DA": "ASBAI/SBP. Dermatite atópica: guia prático, 2022.",
  "SBP-URT": "SBP. Urticária na criança e no adolescente, 2023.",
  "RIN": "ABORL-CCF/ASBAI/SBP. V Consenso Brasileiro sobre Rinites, 2024.",
  "IDSA-PELE": "IDSA. Infecções de pele e partes moles, 2014.",
  "SBP-FRALDA": "SBP. Dermatite de fraldas, 2022.",
  "CDC-ESCAB": "CDC. Clinical care of scabies, 2023.",
  "SBP-PARAS": "SBP. Parasitoses intestinais: diagnóstico e tratamento, 2020.",
  "HSE-CONJ": "HSE (Irlanda). Conjunctivitis (infectious), v3.0, 2026.",
  "SBOP-CONJ": "SBOP/CBO/SBP/ASBAI. Conjuntivite alérgica pediátrica, 2021.",
  "HSE-OE": "HSE (Irlanda). Acute otitis externa, v2.0, 2026.",
  "MS-ESCORP": "Ministério da Saúde/Conitec. PCDT dos acidentes escorpiônicos, 2025.",
  "MS-RAIVA": "Ministério da Saúde. Nota Técnica nº 8/2022: profilaxia da raiva humana.",
  "HSE-MORD": "HSE (Irlanda). Mordeduras humanas, de cão ou gato, v2.2, 2026, e tabela pediátrica de amoxicilina-clavulanato, 2026.",
  "SBP-GI": "SBP. Distúrbios gastrointestinais funcionais no lactente, 2022.",
  "ESPGHAN-P": "ESPGHAN. Probióticos nos distúrbios gastrointestinais pediátricos, 2023.",
  "SBP-MPB": "SBP. Tratamento da doença mão-pé-boca, 2025.",
  "RCH-HSV": "Royal Children's Hospital Melbourne. HSV gingivostomatitis, 2025."
});

Object.assign(AP, {
  desl: { r: "0,5 MG/ML (XAROPE)", c: 0.5 }, nitaz: { r: "20 MG/ML (SUSPENSÃO)", c: 20 },
  aciclo: { r: "200 MG/5 ML (SUSPENSÃO)", c: 40 }, amc250b: { r: "250 MG + 62,5 MG/5 ML", c: 50 }
});

const ANTITERMICOS_DENGUE = { modo: "um", via: "USO ORAL", rotulo: "Antitérmico (escolher um; nada de anti-inflamatório)",
  itens: [
    { nome: "PARACETAMOL", ap: [AP.para], qtd: "1 FRASCO", dose: { gotasKg: 1 }, freq: "DE 6 EM 6 HORAS", dur: "SE FEBRE OU DOR",
      limitePeso: 40, fonte: "MS-DENGUE", nota: "10 mg/kg/dose até de 6/6 h (1 gota/kg na apresentação de 200 mg/mL)." },
    { nome: "DIPIRONA", ap: [AP.dipi], qtd: "1 FRASCO", dose: { gotasKg: 0.4 }, freq: "DE 6 EM 6 HORAS", dur: "SE FEBRE OU DOR",
      limitePeso: 40, idadeMin: 2, fonte: "MS-DENGUE", nota: "10 mg/kg/dose até de 6/6 h (1 mL = 20 gotas). Idade mínima pelo AIDPI (2 meses)." }
  ] };

const ALARME_DENGUE = `ORIENTAÇÕES (DENGUE):
MANTER A HIDRATAÇÃO DURANTE A FEBRE E ATÉ 24 A 48 HORAS DEPOIS QUE ELA PASSAR. MANTER ALIMENTAÇÃO E ALEITAMENTO.
NÃO USAR AAS, ANTI-INFLAMATÓRIOS (IBUPROFENO, CETOPROFENO, NIMESULIDA) NEM CORTICOIDE. NÃO SE AUTOMEDICAR.
RETORNAR NO DIA EM QUE A FEBRE PASSAR; SE A FEBRE CONTINUAR, RETORNAR NO 5º DIA.
VOLTAR IMEDIATAMENTE SE: DOR NA BARRIGA FORTE E CONTÍNUA, VÔMITOS QUE NÃO PARAM, INCHAÇO OU ACÚMULO DE LÍQUIDO, TONTURA OU DESMAIO AO LEVANTAR, SANGRAMENTO DE GENGIVA OU NARIZ, SONOLÊNCIA OU IRRITABILIDADE.`;

window.PRESCRICOES.push(
  /* ============ INFECCIOSAS ============ */
  { id: "dengue", grupo: "Infecciosas", titulo: "Dengue sem sinais de alarme (grupo A, casa)",
    notas: [
      "Grupo A: ambulatório; grupo B: observar até exames e reavaliação. Hemoconcentração ou sinal de alarme: conduzir como grupo C [MS-DENGUE].",
      "Hidratação oral (< 13 anos): até 10 kg 130 mL/kg/dia; 10–20 kg 100 mL/kg/dia; > 20 kg 80 mL/kg/dia. 1/3 como SRO e 2/3 como outros líquidos; 1/3 do total nas primeiras 4–6 h [MS-DENGUE].",
      "Não usar salicilatos, anti-inflamatórios nem corticoide [MS-DENGUE]."
    ],
    orientacoes: ALARME_DENGUE,
    blocos: [
      { modo: "todos", via: "USO ORAL", rotulo: "Hidratação", itens: [
        { nome: "SAIS DE REIDRATAÇÃO ORAL", qtd: "QSP", fonte: "MS-DENGUE", menorQue: 156,
          fixo: (ctx) => { const k = ctx.peso <= 10 ? 130 : ctx.peso <= 20 ? 100 : 80, tot = ctx.peso * k;
            return `LÍQUIDOS: ${fmt(tot)} ML POR DIA. DESSE TOTAL, ${fmt(tot / 3)} ML DE SORO DE REIDRATAÇÃO ORAL (1 ENVELOPE EM 1 LITRO DE ÁGUA FILTRADA) E O RESTANTE EM ÁGUA, SUCOS E CHÁS. OFERECER ${fmt(tot / 3)} ML NAS PRIMEIRAS 4 A 6 HORAS`; },
          nota: "130, 100 ou 80 mL/kg/dia conforme o peso; vale para menores de 13 anos." }
      ] },
      ANTITERMICOS_DENGUE
    ] },

  { id: "escorpiao", grupo: "Infecciosas", titulo: "Picada de escorpião leve (observação e alta)",
    notas: [
      "Leve: dor, eritema, parestesia e sudorese locais. Moderado (sudorese, náuseas, vômitos, alteração cardíaca ou pressórica, agitação) e grave: soro, 3 e 6 frascos [MS-ESCORP].",
      "Leve sem soro: observar 6–12 h. Maior risco em crianças ≤ 10 anos, sobretudo < 7 anos [MS-ESCORP].",
      "Dor leve: dipirona oral; dor intensa: associar infiltração de lidocaína 2% sem vasoconstritor [MS-ESCORP]. Não usar torniquete."
    ],
    orientacoes: `ORIENTAÇÕES (ESCORPIÃO):
MANTER O LOCAL LIMPO; NÃO USAR TORNIQUETE NEM PRODUTOS NO LOCAL.
VOLTAR IMEDIATAMENTE SE: VÔMITOS, SUOR EXCESSIVO, SALIVAÇÃO, AGITAÇÃO OU SONOLÊNCIA, FALTA DE AR, PALPITAÇÃO OU QUALQUER PIORA.`,
    blocos: [ANTITERMICOS] },

  { id: "mordedura", grupo: "Infecciosas", titulo: "Mordedura de cão ou gato",
    notas: [
      "Lavar e irrigar bastante, retirar corpo estranho, avaliar tétano e raiva; ferida infectada fica aberta [HSE-MORD].",
      "Cão ou gato sem sinais de raiva e que pode ser observado: observar o animal por 10 dias, sem iniciar profilaxia. Se sumir, adoecer ou morrer: iniciar já [MS-RAIVA].",
      "Quando indicada: vacina nos dias 0, 3, 7 e 14; soro (SAR 40 UI/kg ou IGHAR 20 UI/kg) até 7 dias após a 1ª dose, infiltrado nas lesões [MS-RAIVA].",
      "Antibiótico profilático: imunossupressão, asplenia, hepatopatia, edema, lesão moderada ou grave em mão ou face, possível penetração em osso ou articulação [IDSA-PELE]. Profilaxia por 3 dias [HSE-MORD]."
    ],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Antibiótico profilático (só se indicado)", itens: [
        { nome: "AMOXICILINA + CLAVULANATO", ap: [AP.amc250b], qtd: "1 FRASCO", fonte: "HSE-MORD",
          dose: { mgDoseFn: (ctx) => (ctx.meses >= 144 || ctx.peso > 40) ? 500 : ctx.peso * (ctx.meses >= 72 ? 7.5 : 6.25) },
          freq: "DE 8 EM 8 HORAS", dur: "POR 3 DIAS",
          nota: "Até 5 anos 6,25 mg/kg/dose; 6–11 anos 7,5 mg/kg/dose; ≥ 12 anos ou > 40 kg 500 mg/dose, de 8/8 h (tabela pediátrica da HSE convertida para mg)." },
        { nome: "SULFAMETOXAZOL + TRIMETOPRIMA", ap: [{ r: "200 MG + 40 MG/5 ML", c: 48 }], qtd: "1 FRASCO", fonte: "HSE-MORD", idadeMin: 3,
          dose: { mgkgdose: 24 }, freq: "DE 12 EM 12 HORAS", dur: "POR 3 DIAS",
          nota: "Alergia à penicilina: 24 mg/kg da combinação de 12/12 h, a partir de 3 meses; evitar em discrasia ou deficiência de G6PD." }
      ] }
    ] },

  /* ============ PELE ============ */
  { id: "urticaria", grupo: "Pele", titulo: "Urticária aguda",
    notas: [
      "Anti-histamínico de 2ª geração; nenhum é superior aos outros. Não combinar anti-histamínicos; 1ª geração não é a escolha habitual [SBP-URT].",
      "Manter algumas semanas depois da melhora [SBP-URT].",
      "Edema de face e pescoço, urticária generalizada com falta de ar ou sintomas circulatórios: pensar em anafilaxia, adrenalina IM e internação [SBP-URT]."
    ],
    orientacoes: `ORIENTAÇÕES (URTICÁRIA):
VOLTAR IMEDIATAMENTE SE: FALTA DE AR, CHIADO, INCHAÇO DE LÁBIOS, LÍNGUA OU ROSTO, ROUQUIDÃO, DIFICULDADE PARA ENGOLIR, TONTURA, DESMAIO OU VÔMITOS REPETIDOS.`,
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Anti-histamínico (escolher um)", itens: [
        { nome: "DESLORATADINA 0,5 MG/ML (XAROPE)", qtd: "1 FRASCO", fonte: "SBP-URT", idadeMin: 6,
          fixo: (ctx) => `DAR ${ctx.meses < 24 ? "2 ML" : ctx.meses < 72 ? "2,5 ML" : ctx.meses < 144 ? "5 ML" : "10 ML (5 MG)"} UMA VEZ AO DIA, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA`,
          nota: "6 m–2 a: 2 mL; 2–6 a: 2,5 mL; 6–11 a: 5 mL; > 12 a: 5 mg, 1×/dia." },
        { nome: "FEXOFENADINA 6 MG/ML (SUSPENSÃO)", qtd: "1 FRASCO", fonte: "RIN", idadeMin: 6,
          fixo: (ctx) => ctx.meses < 24 ? "DAR 2,5 ML (15 MG) DE 12 EM 12 HORAS, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA"
            : ctx.meses < 144 ? "DAR 5 ML (30 MG) DE 12 EM 12 HORAS, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA"
            : "DAR 60 MG DE 12 EM 12 HORAS (OU 120 MG 1 VEZ AO DIA), MANTER POR ALGUMAS SEMANAS APÓS A MELHORA",
          nota: "Doses do consenso de rinites; a tabela de urticária da SBP é ambígua de 6 a 11 anos [RIN] [SBP-URT]." },
        { nome: "CETIRIZINA 1 MG/ML (SOLUÇÃO)", qtd: "1 FRASCO", fonte: "SBP-URT", idadeMin: 24,
          fixo: (ctx) => ctx.meses < 72 ? "DAR 2,5 ML (2,5 MG) DE 12 EM 12 HORAS, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA"
            : ctx.meses < 144 ? "DAR 5 ML (5 MG) DE 12 EM 12 HORAS, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA"
            : "DAR 10 MG 1 VEZ AO DIA, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA",
          nota: "2–6 a: 2,5 mg 12/12 h; 6–12 a: 5 mg 12/12 h; > 12 a: 10 mg/dia. Contraindicada na insuficiência renal grave." },
        { nome: "LORATADINA 1 MG/ML (XAROPE)", qtd: "1 FRASCO", fonte: "SBP-URT", idadeMin: 24,
          fixo: (ctx) => `DAR ${ctx.peso < 30 && ctx.meses < 144 ? "5 ML (5 MG)" : "10 ML (10 MG)"} UMA VEZ AO DIA, MANTER POR ALGUMAS SEMANAS APÓS A MELHORA`,
          nota: "> 2 anos e < 30 kg: 5 mg/dia; > 30 kg ou > 12 anos: 10 mg/dia." }
      ] },
      { modo: "todos", via: "USO ORAL", rotulo: "Só em angioedema importante ou urticária generalizada", opcional: true, itens: [
        { nome: "PREDNISOLONA", ap: [AP.pred3, AP.pred1], qtd: "1 FRASCO", fonte: "SBP-URT", dose: { mgkgdia: 1, vezes: 1 },
          freq: "1 VEZ AO DIA, PELA MANHÃ", dur: "POR 3 A 10 DIAS", nota: "0,5–1 mg/kg/dia (calculado com 1), 3–10 dias. A fonte não traz teto." }
      ] }
    ] },

  { id: "dermatite-atopica", grupo: "Pele", titulo: "Dermatite atópica leve a moderada",
    notas: [
      "Hidratação é a base: 2–3×/dia, nos 3 primeiros minutos após o banho, com a pele úmida. Banho morno de 5–10 min, produto suave [ASBAI-DA].",
      "Na crise: corticoide tópico de baixa ou média potência só nas lesões, 1–2×/dia, 7–14 dias. Cuidado em face e dobras [ASBAI-DA].",
      "Anti-histamínico oral tem pouca ação sobre o prurido; serve sobretudo para dar sono [ASBAI-DA]. Vesículas disseminadas com febre: pensar em eczema herpético."
    ],
    orientacoes: `ORIENTAÇÕES (DERMATITE ATÓPICA):
BANHO MORNO E RÁPIDO (5 A 10 MINUTOS), COM SABONETE SUAVE.
PASSAR O HIDRATANTE 2 A 3 VEZES AO DIA, LOGO APÓS O BANHO, COM A PELE AINDA ÚMIDA.
MANTER AS UNHAS CURTAS. ROUPAS DE ALGODÃO. EVITAR PERFUMES E AMACIANTES.
VOLTAR SE: BOLHAS ESPALHADAS COM FEBRE, PUS NAS LESÕES OU PIORA RÁPIDA.`,
    blocos: [
      { modo: "todos", via: "USO TÓPICO", rotulo: "Cuidado diário", itens: [
        { nome: "HIDRATANTE PARA PELE ATÓPICA", qtd: "1 POTE", fonte: "ASBAI-DA",
          fixo: () => "APLICAR NO CORPO TODO 2 A 3 VEZES AO DIA, LOGO APÓS O BANHO, COM A PELE AINDA ÚMIDA" }
      ] },
      { modo: "um", via: "USO TÓPICO", rotulo: "Na crise (escolher um)", opcional: true, itens: [
        { nome: "HIDROCORTISONA CREME 1%", qtd: "1 TUBO", fonte: "ASBAI-DA",
          fixo: () => "APLICAR FINA CAMADA SÓ NAS LESÕES 1 A 2 VEZES AO DIA POR 7 A 14 DIAS", nota: "Potência muito baixa (0,5–2,5%)." },
        { nome: "DESONIDA CREME 0,05%", qtd: "1 TUBO", fonte: "ASBAI-DA",
          fixo: () => "APLICAR FINA CAMADA SÓ NAS LESÕES 1 A 2 VEZES AO DIA POR 7 A 14 DIAS", nota: "Baixa potência." }
      ] }
    ] },

  { id: "impetigo", grupo: "Pele", titulo: "Impetigo",
    notas: [
      "Localizado: tópico. Oral se lesões numerosas, surto em várias pessoas ou ectima [IDSA-PELE].",
      "A IDSA indica cefalexina oral por 7 dias, mas a tabela de doses pediátricas não está no texto arquivado; a dose abaixo vem da ABORL (50 mg/kg/dia) [IDSA-PELE] [ABORL]."
    ],
    blocos: [
      { modo: "todos", via: "USO TÓPICO", rotulo: "Tópico", itens: [
        { nome: "MUPIROCINA POMADA 2%", qtd: "1 TUBO", fonte: "IDSA-PELE",
          fixo: () => "APLICAR NAS LESÕES DE 12 EM 12 HORAS POR 5 DIAS, APÓS LIMPEZA", nota: "2×/dia por 5 dias." }
      ] },
      { modo: "um", via: "USO ORAL", rotulo: "Oral (lesões numerosas, surto ou ectima)", opcional: true, itens: [
        { nome: "CEFALEXINA", ap: [AP.cefal250], qtd: "QSP", dose: { mgkgdia: 50, vezes: 4 }, freq: "DE 6 EM 6 HORAS", dur: "POR 7 DIAS", fonte: "IDSA-PELE",
          nota: "Duração da IDSA; dose da ABORL." }
      ] },
      ANTITERMICOS
    ] },

  { id: "fraldas", grupo: "Pele", titulo: "Dermatite das fraldas (com ou sem cândida)",
    notas: [
      "Base: barreira com óxido de zinco ou petrolato a cada troca; não remover toda a camada limpa [SBP-FRALDA].",
      "Candidíase: nistatina ou miconazol creme; se houver também na boca, nistatina oral [SBP-FRALDA]. A fonte não traz frequência nem duração do antifúngico.",
      "Não usar nistatina nem corticoide como prevenção. Investigar se persistir, bolhas, sangramento, febre ou perda de peso [SBP-FRALDA]."
    ],
    orientacoes: `ORIENTAÇÕES (FRALDAS):
TROCAR A FRALDA COM FREQUÊNCIA. LIMPAR COM ÁGUA E ALGODÃO, SEM ESFREGAR; EVITAR LENÇOS COM ÁLCOOL OU PERFUME.
NÃO É PRECISO TIRAR TODO O CREME DE BARREIRA A CADA TROCA.
VOLTAR SE: BOLHAS, FERIDAS QUE SANGRAM, FEBRE OU SE NÃO MELHORAR.`,
    blocos: [
      { modo: "todos", via: "USO TÓPICO", rotulo: "Barreira", itens: [
        { nome: "CREME DE BARREIRA COM ÓXIDO DE ZINCO", qtd: "1 TUBO", fonte: "SBP-FRALDA",
          fixo: () => "APLICAR CAMADA GROSSA CUBRINDO A ÁREA A CADA TROCA DE FRALDA" }
      ] },
      { modo: "um", via: "USO TÓPICO", rotulo: "Se candidíase (escolher um)", opcional: true, itens: [
        { nome: "NISTATINA CREME", qtd: "1 TUBO", fonte: "SBP-FRALDA",
          fixo: () => "APLICAR NA ÁREA AFETADA ANTES DO CREME DE BARREIRA, ____ VEZES AO DIA POR ____ DIAS", nota: "Frequência e duração: a fonte não traz; preencher." },
        { nome: "MICONAZOL CREME 2%", qtd: "1 TUBO", fonte: "SBP-FRALDA",
          fixo: () => "APLICAR NA ÁREA AFETADA ANTES DO CREME DE BARREIRA, ____ VEZES AO DIA POR ____ DIAS", nota: "Frequência e duração: a fonte não traz; preencher." }
      ] }
    ] },

  { id: "escabiose", grupo: "Pele", titulo: "Escabiose (sarna)",
    notas: [
      "Permetrina 5% a partir de 2 meses: do pescoço para baixo, retirar após 8–14 h; pode precisar de 2 aplicações com 1 semana de intervalo [CDC-ESCAB].",
      "Ivermectina: 200 mcg/kg, 2 doses com 7–14 dias de intervalo, com alimento. Segurança não estabelecida abaixo de 15 kg [CDC-ESCAB].",
      "Abaixo de 2 meses: enxofre tópico 5–10% [CDC-ESCAB]."
    ],
    blocos: [
      { modo: "um", via: "", rotulo: "Tratamento (escolher um)", itens: [
        { nome: "PERMETRINA LOÇÃO 5%", via: "USO TÓPICO", qtd: "1 FRASCO", fonte: "CDC-ESCAB", idadeMin: 2,
          fixo: () => "APLICAR DO PESCOÇO PARA BAIXO À NOITE, NO CORPO TODO, E RETIRAR NO BANHO APÓS 8 A 14 HORAS. REPETIR APÓS 7 DIAS" },
        { nome: "IVERMECTINA 6 MG", via: "USO ORAL", qtd: "QSP", fonte: "CDC-ESCAB", pesoMinIncl: 15,
          fixo: (ctx) => { const cp = Math.max(0.5, Math.round(ctx.peso * 0.2 / 6 * 2) / 2), int = Math.floor(cp);
            const txt = cp === 0.5 ? "1/2 COMPRIMIDO" : cp % 1 ? `${int} E 1/2 COMPRIMIDOS` : `${cp} ${cp === 1 ? "COMPRIMIDO" : "COMPRIMIDOS"}`;
            return `TOMAR ${txt} COM ALIMENTO, DOSE ÚNICA. REPETIR A MESMA DOSE APÓS 7 A 14 DIAS`; },
          nota: "200 mcg/kg, arredondado para o meio comprimido de 6 mg mais próximo. Só a partir de 15 kg." }
      ] }
    ] },

  /* ============ GASTRO (fase 2) ============ */
  { id: "verminose", grupo: "Gastrointestinal", titulo: "Verminose (ascaridíase, ancilostomíase, enterobíase)",
    notas: [
      "Ascaridíase e ancilostomíase: albendazol 400 mg dose única (200 mg abaixo de 2 anos). Enterobíase: repetir em 2 semanas [SBP-PARAS].",
      "Nitazoxanida 7,5 mg/kg/dose (máximo 500 mg) 2×/dia por 3 dias, a partir de 1 ano, é alternativa [SBP-PARAS].",
      "Giardíase e amebíase: ver a situação própria (metronidazol)."
    ],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Escolher um", itens: [
        { nome: "ALBENDAZOL 400 MG/10 ML (SUSPENSÃO)", qtd: "1 FRASCO", fonte: "SBP-PARAS", idadeMin: 12,
          fixo: (ctx) => ctx.meses < 24 ? "DAR 5 ML (200 MG), DOSE ÚNICA. NA ENTEROBÍASE, REPETIR EM 2 SEMANAS"
                                       : "DAR 10 ML (400 MG), DOSE ÚNICA. NA ENTEROBÍASE, REPETIR EM 2 SEMANAS",
          nota: "12–24 meses: 200 mg; a partir de 2 anos: 400 mg." },
        { nome: "NITAZOXANIDA", ap: [AP.nitaz], qtd: "1 FRASCO", fonte: "SBP-PARAS", idadeMin: 12,
          dose: { mgkgdose: 7.5, maxDose: 500 }, freq: "DE 12 EM 12 HORAS", dur: "POR 3 DIAS", nota: "Pode deixar a urina amarelada." }
      ] }
    ] },

  { id: "constipacao", grupo: "Gastrointestinal", titulo: "Constipação funcional",
    notas: [
      "PEG (3350 ou 4000) é a 1ª escolha. Desimpactação 1–1,5 g/kg/dia por 3 dias (máximo 6 dias seguidos); manutenção 0,2–0,8 g/kg/dia, começando com 0,4 [SBP-CONST] [ESPGHAN-C].",
      "As bulas brasileiras indicam PEG a partir de 2 anos, embora a SBP descreva segurança em qualquer idade [SBP-CONST].",
      "Manter por pelo menos 2 meses, e só reduzir após 1 mês sem sintomas. Não usar enema de fosfato [SBP-CONST].",
      "Alarme: início neonatal, mecônio tardio, fezes em fita, sangue sem fissura, déficit de peso, febre, vômito bilioso, distensão importante [SBP-GI]."
    ],
    orientacoes: `ORIENTAÇÕES (CONSTIPAÇÃO):
SENTAR NO VASO 5 A 10 MINUTOS DEPOIS DAS REFEIÇÕES, COM APOIO PARA OS PÉS. ELOGIAR, NUNCA CASTIGAR.
ALIMENTAÇÃO COM FRUTAS, VERDURAS E GRÃOS; BEBER ÁGUA. ATIVIDADE FÍSICA.
NÃO SUSPENDER O REMÉDIO POR CONTA PRÓPRIA: A RETIRADA É LENTA E COM ORIENTAÇÃO.
VOLTAR SE: VÔMITOS VERDES, BARRIGA MUITO INCHADA, SANGUE NAS FEZES, FEBRE OU PERDA DE PESO.`,
    blocos: [
      { modo: "todos", via: "USO ORAL", rotulo: "Desimpactação (só se houver fecaloma)", opcional: true, itens: [
        { nome: "POLIETILENOGLICOL 4000 (DESIMPACTAÇÃO)", qtd: "1 FRASCO", fonte: "SBP-CONST",
          fixo: (ctx) => `DAR ${num(ctx.peso, 1)} A ${num(ctx.peso * 1.5, 1)} G POR DIA, DILUÍDO EM ÁGUA OU SUCO, POR 3 DIAS (FASE DE DESIMPACTAÇÃO)`,
          nota: "1–1,5 g/kg/dia por 3 dias (máximo 6 dias seguidos)." }
      ] },
      { modo: "todos", via: "USO ORAL", rotulo: "Manutenção", itens: [
        { nome: "POLIETILENOGLICOL 4000 (MANUTENÇÃO)", qtd: "1 FRASCO", fonte: "ESPGHAN-C",
          fixo: (ctx) => `DEPOIS, DAR ${num(ctx.peso * 0.4, 1)} G 1 VEZ AO DIA, AJUSTANDO PARA FEZES PASTOSAS. USO POR PELO MENOS 2 MESES`,
          nota: "Começar com 0,4 g/kg/dia; ajustar entre 0,2 e 0,8 g/kg/dia." }
      ] }
    ] },

  { id: "colica", grupo: "Gastrointestinal", titulo: "Cólica do lactente",
    notas: [
      "Base: tranquilizar e apoiar a família, orientar sobre o choro, avaliar a alimentação [SBP-GI].",
      "L. reuteri DSM 17938 pode ser usado em amamentados: 10⁸ UFC/dia por pelo menos 21 dias (recomendação fraca). Em fórmula, sem evidência para recomendar [ESPGHAN-P].",
      "Febre, ganho de peso ruim ou outra doença: não é cólica funcional [SBP-GI]."
    ],
    orientacoes: `ORIENTAÇÕES (CÓLICA):
O CHORO DA CÓLICA É COMUM E MELHORA COM O TEMPO. PEGAR NO COLO, ENROLAR NA MANTA, AMBIENTE CALMO.
NUNCA SACUDIR O BEBÊ. SE ESTIVER NO LIMITE, DEIXE O BEBÊ SEGURO NO BERÇO E PEÇA AJUDA.
NÃO INTERROMPER A AMAMENTAÇÃO NEM TROCAR O LEITE SEM ORIENTAÇÃO.
VOLTAR SE: FEBRE, VÔMITOS, RECUSA DE MAMAR OU SE NÃO GANHAR PESO.`,
    blocos: [
      { modo: "todos", via: "USO ORAL", rotulo: "Probiótico (opcional, em amamentados)", opcional: true, itens: [
        { nome: "LACTOBACILLUS REUTERI DSM 17938", qtd: "1 FRASCO", fonte: "ESPGHAN-P",
          fixo: () => "DAR A DOSE DO RÓTULO EQUIVALENTE A 100 MILHÕES DE UFC 1 VEZ AO DIA POR PELO MENOS 21 DIAS",
          nota: "10⁸ UFC/dia. A equivalência em gotas depende do produto: confira o rótulo." }
      ] }
    ] },

  /* ============ OLHOS, OUVIDO E BOCA ============ */
  { id: "conjuntivite-bact", grupo: "Olhos, ouvido e boca", titulo: "Conjuntivite bacteriana",
    notas: [
      "Muitas melhoram sozinhas; dá para adiar a receita por 3 dias com higiene [HSE-CONJ].",
      "Encaminhar: dor importante, fotofobia, queda da visão, opacidade da córnea, suspeita de herpes, gonococo ou clamídia [HSE-CONJ].",
      "Tobramicina e tobramicina com dexametasona não aparecem nas fontes arquivadas."
    ],
    orientacoes: `ORIENTAÇÕES (CONJUNTIVITE):
LAVAR AS MÃOS ANTES E DEPOIS DE PINGAR O COLÍRIO. NÃO ENCOSTAR O CONTA-GOTAS NO OLHO.
LIMPAR AS SECREÇÕES COM ALGODÃO E SORO FISIOLÓGICO.
VOLTAR SE: DOR FORTE NO OLHO, PIORA DA VISÃO, INCÔMODO COM A LUZ OU SE NÃO MELHORAR EM 3 DIAS.`,
    blocos: [
      { modo: "um", via: "USO OFTALMOLÓGICO", rotulo: "Colírio (escolher um)", itens: [
        { nome: "CLORANFENICOL COLÍRIO 0,5%", qtd: "1 FRASCO", fonte: "HSE-CONJ",
          fixo: () => "PINGAR 1 A 2 GOTAS NO OLHO AFETADO DE 6 EM 6 HORAS (ACORDADO), ATÉ 48 HORAS APÓS MELHORAR (NO MÁXIMO 7 DIAS)",
          nota: "1ª escolha da fonte; cautela abaixo de 2 anos." },
        { nome: "AZITROMICINA COLÍRIO 15 MG/G", qtd: "1 FRASCO", fonte: "HSE-CONJ",
          fixo: () => "PINGAR 1 GOTA NO OLHO AFETADO DE 12 EM 12 HORAS POR 3 DIAS", nota: "2ª escolha da fonte." }
      ] }
    ] },

  { id: "conjuntivite-alerg", grupo: "Olhos, ouvido e boca", titulo: "Conjuntivite alérgica",
    notas: [
      "Compressas frias e lavagem com soro ajudam a remover alérgenos [SBOP-CONJ].",
      "Corticoide ocular não é 1ª escolha: risco de pressão ocular alta e catarata [SBOP-CONJ]."
    ],
    blocos: [
      { modo: "um", via: "USO OFTALMOLÓGICO", rotulo: "Antialérgico (escolher um)", itens: [
        { nome: "CETOTIFENO COLÍRIO 0,25 MG/ML", qtd: "1 FRASCO", fonte: "RIN", idadeMin: 36,
          fixo: () => "PINGAR 1 GOTA EM CADA OLHO 2 A 3 VEZES AO DIA (NO MÁXIMO 6 SEMANAS)", nota: "A partir de 3 anos." },
        { nome: "OLOPATADINA COLÍRIO 1 MG/ML", qtd: "1 FRASCO", fonte: "RIN", idadeMin: 36,
          fixo: () => "PINGAR 1 GOTA EM CADA OLHO 2 VEZES AO DIA", nota: "A partir de 3 anos." }
      ] },
      { modo: "todos", via: "USO OFTALMOLÓGICO", rotulo: "Adjuvante", opcional: true, itens: [
        { nome: "LÁGRIMA ARTIFICIAL SEM CONSERVANTE", qtd: "1 FRASCO", fonte: "SBOP-CONJ",
          fixo: () => "PINGAR 1 GOTA EM CADA OLHO QUANDO HOUVER INCÔMODO", nota: "Sem conservante, sem limite de frequência; com conservante, até 6×/dia." }
      ] }
    ] },

  { id: "otite-externa", grupo: "Olhos, ouvido e boca", titulo: "Otite externa aguda",
    notas: [
      "Gotas por 7 dias. Tímpano íntegro: gentamicina + hidrocortisona; suspeita de perfuração ou tubo: ciprofloxacino (aminoglicosídeo não) [HSE-OE].",
      "Evitar água e trauma no conduto. Voltar se não melhorar em 48–72 h; dor irradiada ou paralisia facial: avaliação urgente [HSE-OE].",
      "Ciprofloxacino com hidrocortisona e cetoprofeno não aparecem nas fontes arquivadas."
    ],
    blocos: [
      { modo: "um", via: "USO OTOLÓGICO", rotulo: "Gotas (escolher uma)", itens: [
        { nome: "CIPROFLOXACINO SOLUÇÃO OTOLÓGICA", qtd: "1 FRASCO", fonte: "HSE-OE", idadeMin: 12,
          fixo: () => "PINGAR 3 GOTAS NO OUVIDO AFETADO DE 12 EM 12 HORAS POR 7 DIAS", nota: "A partir de 1 ano; serve também com perfuração." },
        { nome: "GENTAMICINA + HIDROCORTISONA OTOLÓGICO", qtd: "1 FRASCO", fonte: "HSE-OE",
          fixo: () => "PINGAR 2 A 4 GOTAS NO OUVIDO AFETADO DE 6 A 8 HORAS E AO DEITAR, POR 7 DIAS", nota: "Só com tímpano íntegro; 7–14 dias." }
      ] },
      ANTITERMICOS
    ] },

  { id: "gengivoestomatite", grupo: "Olhos, ouvido e boca", titulo: "Gengivoestomatite herpética / mão-pé-boca",
    notas: [
      "Base: analgesia e hidratação. Desidratação moderada: SRO 10–20 mL/kg em 1 h [RCH-HSV].",
      "Mão-pé-boca: só sintomáticos; antibiótico, antiviral e antifúngico não [SBP-MPB].",
      "Aciclovir na gengivoestomatite só se até 72 h, com dor intensa ou desidratação; imunodeprimido: IV [RCH-HSV]. Aciclovir tópico não funciona.",
      "Letargia, sonolência ou sinal neurológico: pensar em encefalite [RCH-HSV]."
    ],
    orientacoes: `ORIENTAÇÕES (LESÕES NA BOCA):
OFERECER LÍQUIDOS FRIOS EM POUCA QUANTIDADE E MUITAS VEZES. DAR O ANALGÉSICO ANTES DE COMER OU BEBER.
VASELINA NOS LÁBIOS EVITA QUE GRUDEM.
VOLTAR SE: NÃO CONSEGUIR BEBER, FAZER POUCO XIXI, SONOLÊNCIA, CONVULSÃO OU OLHO VERMELHO E DOLORIDO.`,
    blocos: [
      ANTITERMICOS,
      { modo: "todos", via: "USO ORAL", rotulo: "Aciclovir (gengivoestomatite até 72 h com dor intensa ou desidratação)", opcional: true, itens: [
        { nome: "ACICLOVIR", ap: [AP.aciclo], qtd: "1 FRASCO", fonte: "RCH-HSV", dose: { mgkgdose: 10, maxDose: 400 },
          freq: "5 VEZES AO DIA", dur: "ATÉ NÃO SURGIREM NOVAS LESÕES", nota: "10 mg/kg/dose, máximo 400 mg." }
      ] }
    ] }
);
