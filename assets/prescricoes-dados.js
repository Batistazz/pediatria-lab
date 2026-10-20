/* Prescrições de plantão · Batistaz — dados.
   Cada dose foi conferida nas fontes arquivadas do projeto resumos-pediatria (chaves em FONTES_PRESC).
   Regras de dose:
     mgkgdia: mg/kg/dia dividido em "vezes" tomadas, com tetos opcionais (maxDia, maxDose em mg)
     mgkgdose: mg/kg por tomada
     gotasKg: gotas por kg por tomada (mgGota na apresentação), teto em gotas
     fixo(ctx): texto pronto (doses por idade/peso), sem cálculo por concentração
   ctx = { peso (kg), meses (idade em meses) } */
"use strict";

window.FONTES_PRESC = {
  "AIDPI": "Ministério da Saúde/OPAS. AIDPI Criança: quadros de procedimentos, 2 meses a 5 anos, 2017.",
  "SBP-F": "SBP. Manejo da febre aguda, 2021.",
  "ABORL": "ABORL-CCF. Antibióticos nas IVAS e Rinossinusites, 2024.",
  "AAP-O": "AAP. Diagnosis and management of acute otitis media, 2013.",
  "SBP-PAC": "SBP. Pneumonia adquirida na comunidade não complicada (2022).",
  "SBP-ITU": "SBP. Infecção do trato urinário, 2021.",
  "AWaRe": "OMS. The WHO AWaRe antibiotic book, 2022.",
  "MS-ASMA": "Ministério da Saúde. PCDT da Asma, 2026.",
  "ASBAI": "ASBAI/SBP. Exacerbação de asma na criança e no adolescente, 2021.",
  "GINA": "Global Initiative for Asthma, 2026.",
  "MS-DIA": "Ministério da Saúde. Manejo do paciente com diarreia (cartaz), 2026.",
  "SBP-DIA": "SBP. Diarreia aguda infecciosa, 2023.",
  "NICE-D": "NICE CG84. Gastroenterite em menores de 5 anos.",
  "OMS-24": "OMS. Pneumonia e diarreia em crianças até 10 anos, 2024.",
  "MS-BVA": "Ministério da Saúde. Guia de manejo da bronquiolite viral aguda, 2026.",
  "SBP-CRUPE": "SBP. Crupe viral e bacteriano, 2017.",
  "ABR": "ABORL-CCF. Rinossinusites, 2024.",
  "NICE-G": "NICE NG84. Dor de garganta aguda."
};

/* Apresentações: c = mg por mL; mgGota = mg por gota; bd = formulação de 12/12 h (a dose diária se divide em 2). */
const AP = {
  amox250: { r: "250 MG/5 ML", c: 50 }, amox400: { r: "400 MG/5 ML (BD)", c: 80, bd: true },
  amc250: { r: "250 MG + 62,5 MG/5 ML", c: 50 }, amc400: { r: "400 MG + 57 MG/5 ML (BD)", c: 80, bd: true },
  cefur250: { r: "250 MG/5 ML", c: 50 },
  cefa250: { r: "250 MG/5 ML", c: 50 }, cefa375: { r: "375 MG/5 ML", c: 75 },
  cefal250: { r: "250 MG/5 ML", c: 50 }, cefad250: { r: "250 MG/5 ML", c: 50 }, cefad500: { r: "500 MG/5 ML", c: 100 },
  clar125: { r: "125 MG/5 ML", c: 25 }, clar250: { r: "250 MG/5 ML", c: 50 },
  eri250: { r: "250 MG/5 ML", c: 50 }, azi200: { r: "200 MG/5 ML", c: 40 },
  nitro: { r: "25 MG/5 ML", c: 5 }, smx: { r: "200 MG + 40 MG/5 ML", c: 8, base: "trimetoprima" },
  metro: { r: "200 MG/5 ML", c: 40 }, pred3: { r: "3 MG/ML", c: 3 }, pred1: { r: "1 MG/ML", c: 1 },
  dexa: { r: "0,1 MG/ML (ELIXIR)", c: 0.1 },
  para: { r: "200 MG/ML GOTAS", c: 200, mgGota: 10 }, dipi: { r: "500 MG/ML GOTAS", c: 500, mgGota: 25 },
  ibu: { r: "50 MG/ML GOTAS", c: 50, mgGota: 2.5 }
};

const anos = (ctx) => ctx.meses / 12;

/* Antitérmicos (AIDPI: doses por peso; SBP: não alternar, tratar o desconforto) */
const ANTITERMICOS = {
  modo: "um", via: "USO ORAL", rotulo: "Antitérmico/analgésico (escolher um; não alternar)",
  itens: [
    { nome: "PARACETAMOL", ap: [AP.para], qtd: "1 FRASCO", dose: { gotasKg: 1 }, freq: "DE 6 EM 6 HORAS", dur: "SE FEBRE OU DOR",
      limitePeso: 40, fonte: "AIDPI", nota: "1 gota/kg/dose (10 mg/kg). Máximo diário 75 mg/kg [SBP-F]." },
    { nome: "DIPIRONA", ap: [AP.dipi], qtd: "1 FRASCO", dose: { gotasKg: 0.5, arredBaixo: true }, freq: "DE 6 EM 6 HORAS", dur: "SE FEBRE OU DOR",
      limitePeso: 40, idadeMin: 2, fonte: "AIDPI", nota: "1 gota/2 kg/dose (12,5 mg/kg), arredondado para baixo. A SBP alerta: 1 gota/kg é superdosagem (recomenda 10–12 mg/kg) [SBP-F]." },
    { nome: "IBUPROFENO", ap: [AP.ibu], qtd: "1 FRASCO", dose: { gotasKg: 2, maxGotas: 40 }, freq: "DE 8 EM 8 HORAS", dur: "SE FEBRE OU DOR",
      idadeMin: 6, fonte: "AIDPI", nota: "Só acima de 6 meses e sem suspeita de dengue. Máximo 200 mg/dose." }
  ]
};

const SORO_NASAL = { modo: "todos", via: "USO NASAL", rotulo: "Conforto (opcional)", opcional: true,
  itens: [{ nome: "SORO FISIOLÓGICO 0,9%", qtd: "1 FRASCO", fixo: () => "APLICAR EM CADA NARINA, COM SERINGA, VÁRIAS VEZES AO DIA, PARA CONFORTO",
    fonte: "ABR", nota: "Opção de conforto; sem evidência para prometer eficácia na criança." }] };

window.PRESCRICOES = [
  /* ============ RESPIRATÓRIO ============ */
  { id: "resfriado", grupo: "Respiratório", titulo: "Resfriado comum (IVAS viral)",
    notas: [
      "Não prescrever antibiótico, descongestionante nem anti-histamínico de rotina [ABR]. Xaropes para tosse não entram.",
      "Antitérmico se houver desconforto; não alternar antitérmicos [SBP-F].",
      "Tosse por mais de 14 dias, febre alta ou piora depois de melhorar: reavaliar (complicação, sinusite) [AIDPI] [ABR]."
    ],
    blocos: [ANTITERMICOS, SORO_NASAL] },

  { id: "bronquiolite", grupo: "Respiratório", titulo: "Bronquiolite (alta para casa)",
    notas: [
      "Internar: apneia, estado geral comprometido, desconforto com gemência, retração ou cianose, SatO₂ < 92% persistente, desidratação, recusa alimentar ou idade < 2 meses [MS-BVA].",
      "Não usar salbutamol, adrenalina, corticoide, salina hipertônica, montelucaste nem antibiótico de rotina [MS-BVA].",
      "Nariz limpo e hidratação; antitérmico se desconforto [MS-BVA]."
    ],
    blocos: [ANTITERMICOS, SORO_NASAL] },

  { id: "faringite", grupo: "Respiratório", titulo: "Faringoamigdalite estreptocócica / escarlatina",
    notas: [
      "Tratar o estreptococo previne a febre reumática; o antibiótico iniciado até o 9º dia ainda previne [ABORL].",
      "Na mononucleose, a amoxicilina costuma causar exantema [NICE-G]."
    ],
    blocos: [
      { modo: "um", via: "", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "PENICILINA G BENZATINA", via: "USO INTRAMUSCULAR", qtd: "1 FRASCO-AMPOLA", fonte: "AIDPI",
          fixo: (ctx) => `APLICAR ${ctx.peso < 20 ? "600.000 UI" : "1.200.000 UI"} IM, DOSE ÚNICA`,
          nota: "< 20 kg: 600.000 UI; ≥ 20 kg: 1.200.000 UI. 1ª linha do MS." },
        { nome: "AMOXICILINA", via: "USO ORAL", ap: [AP.amox250, AP.amox400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "ABORL", nota: "Sete dias podem não erradicar o estreptococo." },
        { nome: "CLARITROMICINA", via: "USO ORAL", ap: [AP.clar125, AP.clar250], qtd: "QSP", dose: { mgkgdia: 15, vezes: 2, maxDose: 250 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "ABORL", nota: "Alergia à penicilina. Máximo 250 mg/dose." },
        { nome: "ERITROMICINA", via: "USO ORAL", ap: [AP.eri250], qtd: "QSP", dose: { mgkgdia: 40, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "ABORL", nota: "Alergia à penicilina." }
      ] },
      ANTITERMICOS
    ] },

  { id: "faringite-falha", grupo: "Respiratório", titulo: "Faringoamigdalite: falha com penicilina",
    notas: ["Opções da ABORL para falha com penicilinas, todas por 10 dias [ABORL]."],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "CEFADROXILA", ap: [AP.cefad250, AP.cefad500], qtd: "QSP", dose: { mgkgdia: 50, vezes: 2 }, freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "ABORL" },
        { nome: "CEFALEXINA", ap: [AP.cefal250], qtd: "QSP", dose: { mgkgdia: 50, vezes: 4 }, freq: "DE 6 EM 6 HORAS", dur: "POR 10 DIAS", fonte: "ABORL" },
        { nome: "CLINDAMICINA", ap: [], qtd: "QSP", dose: { mgkgdia: 20, vezes: 3 }, freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "ABORL",
          nota: "Informe a concentração da apresentação disponível." }
      ] },
      ANTITERMICOS
    ] },

  { id: "oma", grupo: "Respiratório", titulo: "Otite média aguda",
    notas: [
      "Analgesia para todos desde o início [AAP-O].",
      "Observar sem antibiótico é opção no caso não grave com seguimento garantido; grave (otalgia moderada a intensa, ≥ 48 h ou T ≥ 39 °C) ou < 6 meses: antibiótico [AAP-O].",
      "Antibiótico oral por 8 dias [AIDPI]. Retorno em 2 dias; se dor e febre persistem com amoxicilina: subir para 80 mg/kg/dia de 12/12 h (BD) ou trocar por amoxicilina-clavulanato [AIDPI]."
    ],
    blocos: [
      { modo: "um", via: "", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "AMOXICILINA", via: "USO ORAL", ap: [AP.amox250, AP.amox400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 8 DIAS", fonte: "AIDPI", nota: "1ª linha do MS. A AAP usa 80–90 mg/kg/dia de 12/12 h." },
        { nome: "AMOXICILINA (PERSISTÊNCIA)", via: "USO ORAL", ap: [AP.amox400], qtd: "QSP", dose: { mgkgdia: 80, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 8 DIAS", fonte: "AIDPI", nota: "No retorno, se dor e febre persistem em uso de amoxicilina." },
        { nome: "AMOXICILINA + CLAVULANATO", via: "USO ORAL", ap: [AP.amc250, AP.amc400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 8 DIAS", fonte: "AIDPI", nota: "2ª linha do MS (50 mg/kg/dia; 12/12 h na formulação BD)." },
        { nome: "CEFUROXIMA", via: "USO ORAL", ap: [AP.cefur250], qtd: "QSP", dose: { mgkgdia: 30, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 8 DIAS", fonte: "ABORL", nota: "Alergia não grave à penicilina." },
        { nome: "CLARITROMICINA", via: "USO ORAL", ap: [AP.clar125, AP.clar250], qtd: "QSP", dose: { mgkgdia: 15, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 8 DIAS", fonte: "ABORL", nota: "Alergia. Azitromicina e cefaclor não (resistência) [ABORL]." },
        { nome: "CEFTRIAXONA", via: "USO INTRAMUSCULAR", ap: [], qtd: "QSP", dose: { mgkgdia: 50, vezes: 1 },
          freq: "1 VEZ AO DIA", dur: "POR 3 DIAS", fonte: "ABORL", nota: "Falha ou intolerância à via oral. A fonte não traz dose máxima." }
      ] },
      ANTITERMICOS
    ] },

  { id: "sinusite", grupo: "Respiratório", titulo: "Rinossinusite bacteriana",
    notas: [
      "Critérios: dupla piora depois do 5º dia, persistência sem melhora (ABR: 14 dias; AAP: > 10 dias) ou início grave [ABR].",
      "Casos leves podem ser observados; tratar logo os moderados e graves [ABR].",
      "Não usar descongestionante, anti-histamínico nem corticoide de rotina [ABR]."
    ],
    blocos: [
      { modo: "um", via: "", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "AMOXICILINA", via: "USO ORAL", ap: [AP.amox250, AP.amox400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "ABR", nota: "25–50 mg/kg/dia, 7–10 dias; 90 mg/kg/dia se suspeita de pneumococo resistente." },
        { nome: "AMOXICILINA + CLAVULANATO", via: "USO ORAL", ap: [AP.amc250, AP.amc400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "ABR", nota: "Produtor de betalactamase ou falha." },
        { nome: "AXETILCEFUROXIMA", via: "USO ORAL", ap: [AP.cefur250], qtd: "QSP", dose: { mgkgdia: 30, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "ABR", nota: "Alergia (25–50 mg/kg/dia); não usar cefalosporina se a reação à penicilina foi grave." },
        { nome: "CLARITROMICINA", via: "USO ORAL", ap: [AP.clar125, AP.clar250], qtd: "QSP", dose: { mgkgdia: 15, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "ABR", nota: "Alergia à penicilina." }
      ] },
      ANTITERMICOS
    ] },

  { id: "crupe", grupo: "Respiratório", titulo: "Crupe viral leve (alta)",
    notas: [
      "Leve: dexametasona 0,15–0,3 mg/kg, dose única, e alta [SBP-CRUPE].",
      "Moderado (estridor e retração em repouso): adrenalina nebulizada + dexametasona 0,3–0,6 mg/kg e observar 3–4 h [SBP-CRUPE]."
    ],
    blocos: [
      { modo: "todos", via: "USO ORAL", rotulo: "Corticoide", itens: [
        { nome: "DEXAMETASONA", ap: [AP.dexa], qtd: "1 FRASCO", dose: { mgkgdose: 0.15 }, freq: "", dur: "DOSE ÚNICA", fonte: "SBP-CRUPE",
          nota: "0,15 mg/kg (faixa 0,15–0,3 mg/kg no crupe leve). Confira a concentração do frasco." }
      ] }
    ] },

  { id: "pac", grupo: "Respiratório", titulo: "Pneumonia adquirida na comunidade (ambulatorial)",
    notas: [
      "Internar: SatO₂ < 92%, desidratação ou não aceita via oral, FR > 70 (< 12 meses) ou > 50 (maiores), gemência, tiragem, apneia, aspecto tóxico, comorbidade, complicação ou < 2 meses [SBP-PAC].",
      "Amoxicilina de 8/8 ou 12/12 h tem resposta equivalente, também acima de 5 anos; reavaliar em 48–72 h [SBP-PAC]."
    ],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "AMOXICILINA", ap: [AP.amox250, AP.amox400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3, maxDia: 4000 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 7 DIAS", fonte: "SBP-PAC", nota: "Máximo 4 g/dia." },
        { nome: "AMOXICILINA + CLAVULANATO", ap: [AP.amc250, AP.amc400], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 },
          freq: "DE 8 EM 8 HORAS", dur: "POR 7 DIAS", fonte: "AIDPI", nota: "2ª linha do MS." },
        { nome: "CEFUROXIMA", ap: [AP.cefur250], qtd: "QSP", dose: { mgkgdia: 30, vezes: 2 },
          freq: "DE 12 EM 12 HORAS", dur: "POR 7 DIAS", fonte: "SBP-PAC", nota: "Alergia não IgE à penicilina. A SBP cita a cefuroxima sem dose; 30 mg/kg/dia é a dose oral da ABORL." }
      ] },
      ANTITERMICOS
    ] },

  { id: "pac-atipica", grupo: "Respiratório", titulo: "Pneumonia atípica (suspeita)",
    notas: ["Somar à amoxicilina ou substituí-la, conforme a suspeita [SBP-PAC]."],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Macrolídeo (escolher um)", itens: [
        { nome: "AZITROMICINA", ap: [AP.azi200], qtd: "QSP", dose: { mgkgdia: 10, vezes: 1 }, freq: "1 VEZ AO DIA", dur: "POR 5 DIAS", fonte: "SBP-PAC",
          nota: "10 mg/kg/dia por 5 dias. A fonte não traz dose máxima." },
        { nome: "CLARITROMICINA", ap: [AP.clar125, AP.clar250], qtd: "QSP", dose: { mgkgdia: 15, vezes: 2, maxDia: 1000 }, freq: "DE 12 EM 12 HORAS", dur: "POR 7 A 10 DIAS", fonte: "SBP-PAC", nota: "Máximo 1 g/dia." },
        { nome: "ERITROMICINA", ap: [AP.eri250], qtd: "QSP", dose: { mgkgdia: 40, vezes: 4, maxDia: 2000 }, freq: "DE 6 EM 6 HORAS", dur: "POR 7 A 10 DIAS", fonte: "SBP-PAC", nota: "Máximo 2 g/dia." }
      ] },
      ANTITERMICOS
    ] },

  { id: "asma", grupo: "Respiratório", titulo: "Crise de asma / sibilância (alta)",
    notas: [
      "Alta: estável, sem O₂, aceitando dieta; retorno em 1–2 dias [ASBAI].",
      "O AIDPI ainda prescreve salbutamol em horário fixo; GINA e PCDT preferem alívio sob demanda com corticoide inalatório. Nunca alta só com salbutamol [MS-ASMA] [GINA].",
      "Espaçador: 1 jato por vez, respirando pelo espaçador depois de cada jato [GINA]."
    ],
    blocos: [
      { modo: "todos", via: "USO INALATÓRIO COM ESPAÇADOR", rotulo: "Broncodilatador", itens: [
        { nome: "SALBUTAMOL 100 MCG/JATO", qtd: "1 FRASCO", fonte: "AIDPI",
          fixo: (ctx) => `APLICAR ${anos(ctx) < 2 ? "2 A 3 JATOS" : "2 A 4 JATOS"}, UM JATO POR VEZ, DE 6 EM 6 HORAS POR 5 DIAS`,
          nota: "< 2 anos: 2–3 jatos; ≥ 2 anos: 2–4 jatos, de 6/6 h por 5 dias." }
      ] },
      { modo: "todos", via: "USO ORAL", rotulo: "Corticoide oral", itens: [
        { nome: "PREDNISOLONA", ap: [AP.pred3, AP.pred1], qtd: "1 FRASCO",
          dose: { mgkgdia: 1, vezes: 1, maxDiaFn: (ctx) => anos(ctx) < 2 ? 20 : anos(ctx) < 6 ? 30 : 40 },
          freq: "1 VEZ AO DIA, PELA MANHÃ", dur: "POR 3 A 5 DIAS", fonte: "ASBAI",
          menorQue: 144, nota: "1–2 mg/kg/dia (calculado com 1 mg/kg); máximo 20 mg (< 2 anos), 30 mg (2–5) e 40 mg (6–11). Adolescente: 40–50 mg/dia por 5–7 dias. Sem desmame." }
      ] },
      { modo: "todos", via: "USO INALATÓRIO COM ESPAÇADOR · USO CONTÍNUO", rotulo: "Corticoide inalatório (iniciar se não usa)", opcional: true, itens: [
        { nome: "BECLOMETASONA 50 MCG/JATO", qtd: "1 FRASCO", fonte: "MS-ASMA", menorQue: 144,
          fixo: (ctx) => anos(ctx) < 6 ? "APLICAR 1 JATO DE 12 EM 12 HORAS (100 MCG/DIA), USO CONTÍNUO. ENXAGUAR A BOCA DEPOIS"
                                       : "APLICAR 1 A 2 JATOS DE 12 EM 12 HORAS (100–200 MCG/DIA), USO CONTÍNUO. ENXAGUAR A BOCA DEPOIS",
          nota: "Dose baixa: 100 mcg/dia até 5 anos; 100–200 mcg/dia de 6 a 11 anos [MS-ASMA]. Enxaguar e cuspir depois do uso [GINA]. ≥ 12 anos: ver etapas no caderno de asma." }
      ] }
    ] },

  /* ============ GASTRO ============ */
  { id: "diarreia-a", grupo: "Gastrointestinal", titulo: "Diarreia aguda · Plano A (casa)",
    notas: [
      "Mais líquido, mesma alimentação, zinco e sinais de alerta; manter o aleitamento [MS-DIA].",
      "Não usar antidiarreico; antibiótico só na disenteria com comprometimento do estado geral [MS-DIA].",
      "Ondansetrona só em dose única no Plano B, no serviço, se vômitos persistentes [MS-DIA]: não entra na receita para casa."
    ],
    blocos: [
      { modo: "todos", via: "USO ORAL", rotulo: "Reidratação e zinco", itens: [
        { nome: "SAIS DE REIDRATAÇÃO ORAL", qtd: "4 ENVELOPES", fonte: "MS-DIA",
          fixo: (ctx) => `DILUIR 1 ENVELOPE EM 1 LITRO DE ÁGUA FILTRADA E DAR ${ctx.meses < 12 ? "50 A 100 ML" : ctx.meses < 120 ? "100 A 200 ML" : "O QUANTO ACEITAR"} APÓS CADA EVACUAÇÃO OU VÔMITO`,
          nota: "< 1 ano: 50–100 mL; 1–10 anos: 100–200 mL; > 10 anos: o que aceitar." },
        { nome: "ZINCO", qtd: "1 FRASCO", fonte: "MS-DIA", menorQue: 60,
          fixo: (ctx) => `DAR ${ctx.meses <= 6 ? "10 MG" : "20 MG"} UMA VEZ AO DIA POR 10 A 14 DIAS (CONFERIR O VOLUME PELA CONCENTRAÇÃO DO FRASCO)`,
          nota: "Até 6 meses: 10 mg/dia; > 6 meses e < 5 anos: 20 mg/dia; 10–14 dias." }
      ] },
      { modo: "todos", via: "USO ORAL", rotulo: "Coadjuvantes com divergência entre fontes", opcional: true, itens: [
        { nome: "SACCHAROMYCES BOULARDII CNCM I-745", qtd: "1 CAIXA", fonte: "SBP-DIA",
          fixo: () => "DAR 250 A 750 MG POR DIA POR 5 A 7 DIAS (CONFERIR A CEPA NO RÓTULO)",
          nota: "A SBP admite cepas específicas (reduzem a diarreia em ~1 dia); a OMS sugere não usar [OMS-24]." },
        { nome: "RACECADOTRILA", qtd: "1 CAIXA", fonte: "SBP-DIA", idadeMin: 3, dose: { mgkgdose: 1.5 }, ap: [],
          freq: "DE 8 EM 8 HORAS", dur: "ATÉ CESSAR A DIARREIA", nota: "1,5 mg/kg 3×/dia, contraindicada < 3 meses; sachês de 10 e 30 mg. O NICE não recomenda [NICE-D]." }
      ] },
      ANTITERMICOS
    ] },

  { id: "disenteria", grupo: "Gastrointestinal", titulo: "Disenteria com comprometimento do estado geral",
    notas: [
      "Antibiótico só na disenteria com desidratação, febre alta persistente, dor abdominal, tenesmo ou comprometimento sistêmico [MS-DIA].",
      "Sangue persistente após 48 h, até 10 anos: internar [MS-DIA]. Menor de 3 meses ou imunodeficiente: ceftriaxona EV e referenciar."
    ],
    blocos: [
      { modo: "um", via: "", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "AZITROMICINA", via: "USO ORAL", ap: [AP.azi200], qtd: "QSP", fonte: "MS-DIA", idadeMin: 3, pesoMax: 30,
          dose: { azitroDia1: 10, azitroDepois: 5 }, nota: "Até 30 kg: 10 mg/kg no 1º dia e 5 mg/kg/dia por mais 4 dias." },
        { nome: "CIPROFLOXACINO 500 MG", via: "USO ORAL", qtd: "6 COMPRIMIDOS", fonte: "MS-DIA", pesoMin: 30,
          fixo: () => "TOMAR 1 COMPRIMIDO DE 12 EM 12 HORAS POR 3 DIAS", nota: "Acima de 30 kg (mais de 10 anos)." },
        { nome: "CEFTRIAXONA", via: "USO INTRAMUSCULAR", ap: [], qtd: "QSP", fonte: "MS-DIA", dose: { mgkgdia: 50, vezes: 1 },
          freq: "1 VEZ AO DIA", dur: "POR 3 A 5 DIAS", nota: "Alternativa: 50 mg/kg/dia (até 30 kg) ou 50–100 mg/kg/dia (acima)." }
      ] },
      ANTITERMICOS
    ] },

  { id: "parasitose", grupo: "Gastrointestinal", titulo: "Giardíase ou amebíase com indicação",
    notas: ["Giardíase: diarreia ≥ 14 dias com cistos ou trofozoítos. Amebíase: falha no tratamento da Shigella ou trofozoítos de E. histolytica com hemácias [MS-DIA]."],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Metronidazol (escolher a indicação)", itens: [
        { nome: "METRONIDAZOL (GIARDÍASE)", ap: [AP.metro], qtd: "QSP", dose: { mgkgdia: 15, vezes: 3 }, freq: "DE 8 EM 8 HORAS", dur: "POR 5 DIAS", fonte: "MS-DIA" },
        { nome: "METRONIDAZOL (AMEBÍASE)", ap: [AP.metro], qtd: "QSP", dose: { mgkgdia: 50, vezes: 3 }, freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "MS-DIA" }
      ] }
    ] },

  { id: "plano-b", grupo: "Gastrointestinal", titulo: "Desidratação · Plano B (no serviço)",
    notas: ["Reavaliar pelo quadro de hidratação; sem melhora em 6 h: encaminhar para internação [MS-DIA]."],
    blocos: [
      { modo: "todos", via: "NO SERVIÇO", rotulo: "Reidratação oral", itens: [
        { nome: "SRO", qtd: "", fonte: "MS-DIA",
          fixo: (ctx) => `OFERECER ${fmt(ctx.peso * 50)} A ${fmt(ctx.peso * 100)} ML (MÉDIA ${fmt(ctx.peso * 75)} ML) EM 4 A 6 HORAS, CONFORME A SEDE`,
          nota: "50–100 mL/kg (média 75 mL/kg) em 4–6 h." },
        { nome: "ONDANSETRONA (SE VÔMITOS PERSISTENTES)", qtd: "", fonte: "MS-DIA", idadeMin: 6,
          fixo: (ctx) => `DAR ${anos(ctx) <= 2 ? "2 MG" : (anos(ctx) <= 10 && ctx.peso <= 30) ? "4 MG" : "8 MG"} VO, DOSE ÚNICA`,
          nota: "6 meses–2 anos: 2 mg; > 2–10 anos (até 30 kg): 4 mg; > 10 anos (> 30 kg): 8 mg. Dose única." }
      ] }
    ] },

  { id: "plano-c", grupo: "Gastrointestinal", titulo: "Desidratação grave · Plano C (expansão)",
    notas: ["SF 0,9% ou Ringer lactato; reavaliar após cada etapa [MS-DIA]."],
    blocos: [
      { modo: "todos", via: "USO ENDOVENOSO", rotulo: "Expansão", itens: [
        { nome: "SF 0,9% OU RINGER LACTATO", qtd: "", fonte: "MS-DIA",
          fixo: (ctx) => ctx.meses < 12
            ? `1ª ETAPA: ${fmt(ctx.peso * 30)} ML EM 1 HORA. 2ª ETAPA: ${fmt(ctx.peso * 70)} ML EM 5 HORAS`
            : `1ª ETAPA: ${fmt(ctx.peso * 30)} ML EM 30 MINUTOS. 2ª ETAPA: ${fmt(ctx.peso * 70)} ML EM 2 HORAS E 30 MINUTOS`,
          nota: "< 1 ano: 30 mL/kg em 1 h + 70 mL/kg em 5 h; ≥ 1 ano: 30 mL/kg em 30 min + 70 mL/kg em 2 h 30." }
      ] }
    ] },

  /* ============ URINÁRIO ============ */
  { id: "itu-febril", grupo: "Urinário", titulo: "ITU febril (oral)",
    notas: [
      "Urocultura sempre na criança [AWaRe]. Tratamento da ITU febril: 10 dias [SBP-ITU].",
      "Parenteral (cefuroxima, gentamicina, amicacina ou cefotaxima) quando não dá para tratar por via oral: ver caderno de antibioticoterapia [SBP-ITU]."
    ],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "CEFUROXIMA", ap: [AP.cefur250], qtd: "QSP", dose: { mgkgdia: 30, vezes: 2 }, freq: "DE 12 EM 12 HORAS", dur: "POR 10 DIAS", fonte: "SBP-ITU" },
        { nome: "CEFACLOR", ap: [AP.cefa250, AP.cefa375], qtd: "QSP", dose: { mgkgdia: 40, vezes: 3 }, freq: "DE 8 EM 8 HORAS", dur: "POR 10 DIAS", fonte: "SBP-ITU" }
      ] },
      ANTITERMICOS
    ] },

  { id: "itu-afebril", grupo: "Urinário", titulo: "ITU afebril (cistite)",
    notas: ["A SBP não traz a duração da ITU afebril; a OMS usa 3–5 dias para infecção urinária baixa [SBP-ITU] [AWaRe]."],
    blocos: [
      { modo: "um", via: "USO ORAL", rotulo: "Antibiótico (escolher um)", itens: [
        { nome: "CEFALEXINA", ap: [AP.cefal250], qtd: "QSP", dose: { mgkgdia: 50, vezes: 4 }, freq: "DE 6 EM 6 HORAS", dur: "POR 3 A 5 DIAS", fonte: "SBP-ITU" },
        { nome: "NITROFURANTOÍNA", ap: [AP.nitro], qtd: "QSP", dose: { mgkgdia: 6, vezes: 4 }, freq: "DE 6 EM 6 HORAS", dur: "POR 3 A 5 DIAS", fonte: "SBP-ITU",
          nota: "5–7 mg/kg/dia (calculado com 6)." },
        { nome: "SULFAMETOXAZOL + TRIMETOPRIMA", ap: [AP.smx], qtd: "QSP", dose: { mgkgdia: 10, vezes: 2 }, freq: "DE 12 EM 12 HORAS", dur: "POR 3 A 5 DIAS", fonte: "SBP-ITU",
          nota: "8–12 mg de trimetoprima/kg/dia (calculado com 10)." }
      ] }
    ] }
];

/* Modelos de texto (sem dose). Sem dados de pacientes. */
window.MODELOS_TEXTO = [
  { id: "evolucao", titulo: "Evolução · pronto atendimento", texto:
`# PLANTÃO DIURNO - PEDIATRIA - PRONTO ATENDIMENTO #
ACOMPANHANTE:
INÍCIO DOS SINTOMAS:
RESPONSÁVEL RELATA QUADRO DE
DIURESE E EVACUAÇÕES PRESENTES E SEM ALTERAÇÕES.
ACEITANDO DIETA VO.

HPP:
NEGA DOENÇAS PRÉVIAS.
NEGA INTERNAÇÕES RECENTES.
ALERGIA A MEDICAMENTOS:
VACINAÇÃO: EM DIA (SIC)

PESO:
FC (BPM):      // FR (IRPM):      // SPO2 AA (%):      // TAX (°C):
BEG, ATIVO E REATIVO, CORADO, HIDRATADO, ACIANÓTICO, ANICTÉRICO
ORO: SEM ALTERAÇÕES // NASO: SEM ALTERAÇÕES // OTO: SEM ALTERAÇÕES
ACV: RCR 2T BNF S/ SOPROS. PERFUSÃO CAPILAR < 2 SEG
AR: MVUA S/ RA. SEM ESFORÇO RESPIRATÓRIO
ABD: LIVRE, NORMOTENSO, RHA+, TIMPÂNICO, INDOLOR À PALPAÇÃO, SEM MASSAS OU VISCEROMEGALIAS
NEURO: ECG 15, AUSÊNCIA DE RIGIDEZ DE NUCA

ALTA MÉDICA DA URGÊNCIA COM PRESCRIÇÃO DE SINTOMÁTICOS + ORIENTAÇÕES GERAIS.
ORIENTO RETORNO EM CASO DE SURGIMENTO DE SINAIS DE ALARME. ACOMPANHANTE COMPREENDE E CONCORDA COM CONDUTAS.` },

  { id: "taquipneia", titulo: "Referência · respiração rápida (AIDPI)", texto:
`RESPIRAÇÃO RÁPIDA (AIDPI):
< 2 MESES: ≥ 60 IRPM
2 A 11 MESES: ≥ 50 IRPM
1 A 4 ANOS: ≥ 40 IRPM` },

  { id: "reavaliacao", titulo: "Reavaliação após medicação", texto:
`REAVALIAÇÃO MÉDICA
REALIZADA OBSERVAÇÃO APÓS ADMINISTRAÇÃO DA MEDICAÇÃO, SEM REGISTRO DE EVENTOS ADVERSOS, SINAIS DE ALERGIA OU PIORA CLÍNICA. PACIENTE EM BOM ESTADO GERAL, HEMODINAMICAMENTE ESTÁVEL.` },

  { id: "rx", titulo: "Laudos de RX sem alterações", texto:
`RX TÓRAX:
TRAQUEIA CENTRALIZADA, SEIOS CARDIO E COSTOFRÊNICOS LIVRES, MARGEM CARDÍACA BEM DELIMITADA, SEM OPACIDADES PULMONARES SUGESTIVAS DE CONSOLIDAÇÕES OU ATELECTASIAS, DIAFRAGMA NORMOPOSICIONADO. ESTRUTURAS ÓSSEAS SEM ALTERAÇÕES EVIDENTES.

RX ABDOME:
DISTRIBUIÇÃO DE GASES INTESTINAIS DENTRO DOS PADRÕES DE NORMALIDADE, SEM EVIDÊNCIAS DE DISTENSÃO SIGNIFICATIVA DE ALÇAS. AUSÊNCIA DE NÍVEIS HIDROAÉREOS PATOLÓGICOS. NÃO HÁ SINAIS DE PNEUMOPERITÔNIO. ESTRUTURAS ÓSSEAS SEM ALTERAÇÕES EVIDENTES.` },

  { id: "alta", titulo: "Orientações pós-alta e sinais de alarme", texto:
`ORIENTAÇÕES PÓS ALTA DA URGÊNCIA:
O PACIENTE DEVERÁ SER REAVALIADO EM UNIDADE BÁSICA DE SAÚDE ENTRE 24 A 48 HORAS PARA CONTINUIDADE DO CUIDADO. NA PRESENÇA DOS SINAIS DE ALARME, DESCRITOS ABAIXO E ORIENTADOS NA CONSULTA, DEVERÁ RETORNAR DE FORMA IMEDIATA AO PRONTO ATENDIMENTO MAIS PRÓXIMO:

SINAIS DE ALARME:
- CANSAÇO PARA RESPIRAR (AFUNDAMENTO DA FÚRCULA, DAS COSTELAS, BATIMENTO DA ASA DO NARIZ, RESPIRAÇÃO OFEGANTE)
- ALTERAÇÃO DA COR DA PELE E DAS MUCOSAS ("FICAR ROXINHO", PÁLIDO OU AMARELO)
- SONOLÊNCIA EXCESSIVA, IRRITABILIDADE EXCESSIVA OU CONVULSÃO
- VÔMITOS PERSISTENTES, DIARREIA LÍQUIDA COM SANGUE OU MUCO
- RECUSA DE ALIMENTAÇÃO OU DE LÍQUIDOS
- SINAIS DE DESIDRATAÇÃO: SEDE EXCESSIVA, OLHOS FUNDOS, CHORO SEM LÁGRIMA, MUITO TEMPO SEM FAZER XIXI
- FONTANELA (MOLEIRA) ESTUFADA

NÃO IGNORE OS SINAIS DE ALARME EM CRIANÇAS. PROCURE AJUDA MÉDICA IMEDIATAMENTE.` },

  { id: "abcde", titulo: "Avaliação ABCDE (PALS) + SAMPLE", texto:
`AVALIAÇÃO INICIAL: APARÊNCIA / RESPIRAÇÃO (ESFORÇO) / CIRCULAÇÃO (COR DA PELE)

A: VIA AÉREA PÉRVIA
B: MVUA S/ RA, SEM ESFORÇO RESPIRATÓRIO. FR    (IRPM), SATO2 (%)
C: PERFUSÃO < 2 SEGUNDOS, PULSOS PERIFÉRICOS E CENTRAIS AMPLOS, PA      MMHG, RCR 2T BNF S/ SOPROS, SEM HEPATOMEGALIA
D: AVDI (ALERTA, VOZ, DOR, INCONSCIENTE), PUPILAS ISOFOTORREAGENTES, GLICEMIA CAPILAR
E: TAX (°C)    , PELE SEM HEMATOMAS, PETÉQUIAS, EQUIMOSES OU ESCORIAÇÕES

AVALIAÇÃO SECUNDÁRIA (SAMPLE):
S SINAIS E SINTOMAS / A ALERGIAS / M MEDICAMENTOS EM USO / P PASSADO MÉDICO / L ÚLTIMA REFEIÇÃO / E EVENTOS QUE ANTECEDERAM` },

  { id: "tce", titulo: "TCE leve · admissão e reavaliação", texto:
`# TCE
SINAIS DE ALARME: VÔMITOS, CEFALEIA, SONOLÊNCIA, AGITAÇÃO, PERDA DO NÍVEL DE CONSCIÊNCIA.

PESO:
A: VIA AÉREA PÉRVIA. SEM ALTERAÇÃO CERVICAL
B: MVUA S/ RA. SEM SINAIS DE ESFORÇO RESPIRATÓRIO. SPO2 AA (%)     // FR (IRPM)
C: RCR 2T BNF S/ SOPROS. PERFUSÃO CAPILAR < 2 SEG. PULSOS CHEIOS E SIMÉTRICOS. FC (BPM):
D: CRIANÇA DESPERTA, INTERATIVA. SEM DÉFICITS NEUROLÓGICOS, PUPILAS ISOCÓRICAS E FOTORREAGENTES. ECG 15
E: HEMATOMA SUBGALEAL EM REGIÃO     , SEM SANGRAMENTOS ATIVOS À OTOSCOPIA, NASOSCOPIA E OROSCOPIA. TAX (°C):

CD: MANTENHO MONITORIZAÇÃO CONTÍNUA. MANTENHO EM OBSERVAÇÃO. ORIENTO RESPONSÁVEL EM RELAÇÃO AO QUADRO, MEDIDAS PROPOSTAS E EVOLUÇÃO ESPERADA.

REAVALIAÇÃO MÉDICA
PACIENTE EM OBSERVAÇÃO APÓS TCE LEVE, SOB MONITORIZAÇÃO CLÍNICA. EVOLUIU SEM INTERCORRÊNCIAS, HEMODINAMICAMENTE ESTÁVEL, AFEBRIL, CONSCIENTE, ECG 15. SEM VÔMITOS, SONOLÊNCIA EXCESSIVA, CONVULSÕES, ALTERAÇÃO COMPORTAMENTAL, DÉFICIT MOTOR OU SENSITIVO, OTORRAGIA OU RINORRAGIA.
EXAME NEUROLÓGICO SEM DÉFICITS FOCAIS, PUPILAS ISOCÓRICAS E FOTORREAGENTES, FORÇA PRESERVADA E SIMÉTRICA, MARCHA SEM ANORMALIDADES.
ALTA COM ORIENTAÇÃO DE RETORNO IMEDIATO SE: VÔMITOS PERSISTENTES, CEFALEIA INTENSA OU PROGRESSIVA, SONOLÊNCIA EXCESSIVA, DESMAIOS, CONVULSÕES, CONFUSÃO MENTAL, ALTERAÇÃO DO COMPORTAMENTO, DIFICULDADE PARA CAMINHAR, FRAQUEZA, ALTERAÇÕES VISUAIS OU QUALQUER PIORA. RESPONSÁVEL COMPREENDE E CONCORDA.` },

  { id: "convulsao", titulo: "Crise convulsiva · registro", texto:
`SOU CHAMADO(A) PARA AVALIAÇÃO DE CRIANÇA EM CRISE CONVULSIVA. LEVADA EM MACA PARA A SALA DE EMERGÊNCIA.
A: VIA AÉREA PÉRVIA. SEM ALTERAÇÃO CERVICAL
B: MVUA S/ RA. FR (IRPM)     // SPO2 AA (%)     . O2 POR CATETER NASAL NA VIGÊNCIA DA CRISE
C: RCR 2T BNF S/ SOPROS. PERFUSÃO CAPILAR < 2 SEG. PULSOS CHEIOS E SIMÉTRICOS. FC (BPM):     // PA (MMHG):
D: CRISE TÔNICO-CLÔNICA GENERALIZADA. MEDICAÇÃO:          . EVOLUÇÃO:          . PUPILAS:
E: PELE SEM SUFUSÕES HEMORRÁGICAS. TAX (°C):     // HGT (MG/DL):

CD:` },

  { id: "atestado", titulo: "Atestado (afastamento escolar)", texto:
`ATESTADO MÉDICO
ATESTO PARA OS DEVIDOS FINS QUE O(A) PACIENTE SUPRACITADO(A) NECESSITA DE ___ (___) DIAS DE AFASTAMENTO DAS SUAS ATIVIDADES ESCOLARES E ESPORTIVAS, A PARTIR DESTA DATA, POR MOTIVO DE DOENÇA.
OBS: PACIENTE NECESSITA DOS CUIDADOS MATERNOS DE __________ PARA MELHORA DO QUADRO CLÍNICO.` },

  { id: "comparecimento", titulo: "Declaração de comparecimento", texto:
`DECLARAÇÃO DE COMPARECIMENTO
DECLARO PARA OS DEVIDOS FINS QUE O(A) SR(A) __________ ACOMPANHOU SEU/SUA FILHO(A) __________ EM CONSULTA MÉDICA HOJE, DIA ______, DAS ____ ÀS ____, PODENDO RETORNAR AO SEU TRABALHO.` },

  { id: "internacao", titulo: "Declaração de internação (acompanhante)", texto:
`DECLARAÇÃO MÉDICA
DECLARO, PARA OS DEVIDOS FINS, QUE O(A) MENOR __________ ENCONTRA-SE INTERNADO(A) NESTA UNIDADE HOSPITALAR DESDE ___/___/______, SOB ACOMPANHAMENTO MÉDICO CONTÍNUO, EM DECORRÊNCIA DE QUADRO CLÍNICO QUE DEMANDA ASSISTÊNCIA HOSPITALAR E MONITORIZAÇÃO PERMANENTE, NÃO HAVENDO PREVISÃO DE ALTA ATÉ A PRESENTE DATA. FAZ-SE NECESSÁRIA A PERMANÊNCIA DO(A) RESPONSÁVEL, SR(A). __________, DURANTE A HOSPITALIZAÇÃO.` }
];

function fmt(v) { return Math.round(v).toLocaleString("pt-BR"); }
