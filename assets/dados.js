/* Temas do internato de pediatria. Para anexar um resumo pronto: preencher "arquivos" e "atualizado". */
window.TEMAS = [
  { id: "ivas", titulo: "IVAS", sub: "Resfriado, otite média aguda, faringoamigdalite, sinusite e crupe" },
  {
    id: "bronquiolite", titulo: "Bronquiolite Viral Aguda", sub: "Do primeiro chiado à alta",
    fontes: "Ministério da Saúde 2026 · NICE NG9 · Diretriz australasiana 2025 · CVE-SP (nirsevimabe) 2026",
    atualizado: "2026-10-19",
    arquivos: {
      capa: "resumos/bronquiolite/capa.jpg",
      caderno: { href: "resumos/bronquiolite/caderno.pdf", paginas: 16 },
      flash: { href: "resumos/bronquiolite/flash.pdf", paginas: 2 },
      cartao: { href: "resumos/bronquiolite/cartao.pdf", paginas: 1 },
    },
  },
  { id: "pneumonia", titulo: "Pneumonia", sub: "Pneumonia adquirida na comunidade, não complicada e complicada" },
  { id: "asma", titulo: "Asma", sub: "Crise no pronto-socorro e tratamento de manutenção" },
  { id: "choque", titulo: "Choque", sub: "Sepse e choque séptico na criança" },
  { id: "pcr", titulo: "Parada Cardiorrespiratória", sub: "Suporte básico e avançado de vida pediátrico" },
  { id: "atb", titulo: "Antibioticoterapia", sub: "Escolhas empíricas e doses nas infecções comuns" },
  { id: "ictericia", titulo: "Icterícia Neonatal", sub: "Hiperbilirrubinemia indireta e colestase" },
  { id: "reanimacao-neo", titulo: "Reanimação Neonatal", sub: "Sala de parto: ≥34 e <34 semanas" },
  { id: "diarreia", titulo: "Diarreia Aguda", sub: "Avaliação da hidratação e planos A, B e C" },
];
