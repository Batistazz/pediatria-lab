/* Resumos de Pediatria · Batistaz — página única com os temas e seus PDFs. */
"use strict";

const esc = (texto) => String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dataCompleta = (iso) => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
const pag = (n) => `${n} ${n === 1 ? "página" : "páginas"}`;

function cardPronto(t) {
  const a = t.arquivos;
  return `
    <article class="resumo-card" id="${esc(t.id)}">
      <a href="${esc(a.caderno.href)}" target="_blank" rel="noopener"><img src="${esc(a.capa)}" alt="Capa: ${esc(t.titulo)}" loading="lazy"></a>
      <div>
        <span class="rotulo">Disponível</span>
        <h2>${esc(t.titulo)}</h2>
        <p class="sub">${esc(t.sub)}</p>
        <span class="acoes">
          <a class="botao" href="${esc(a.caderno.href)}" target="_blank" rel="noopener">Caderno de Estudos · ${pag(a.caderno.paginas)}</a>
          <a class="botao claro" href="${esc(a.flash.href)}" target="_blank" rel="noopener">Revisão Flash · ${pag(a.flash.paginas)}</a>
          <a class="botao claro" href="${esc(a.cartao.href)}" target="_blank" rel="noopener">Cartão de Plantão · ${pag(a.cartao.paginas)}</a>
        </span>
        ${t.fontes ? `<small>Fontes principais: ${esc(t.fontes)}</small>` : ""}
        <small>Atualizado em ${dataCompleta(t.atualizado)}</small>
      </div>
    </article>`;
}

function linhaPendente(t) {
  return `
    <li class="sessao" id="${esc(t.id)}">
      <div><h3>${esc(t.titulo)}</h3><p>${esc(t.sub)}</p></div>
      <span class="selo">em preparação</span>
    </li>`;
}

function render() {
  const temas = window.TEMAS ?? [];
  const prontos = temas.filter((t) => t.arquivos);
  const pendentes = temas.filter((t) => !t.arquivos);
  document.getElementById("conteudo").innerHTML = `
    <section class="abertura">
      <span class="rotulo">Internato de Pediatria · 10º período</span>
      <h1>Resumos de Pediatria</h1>
      <p>Para cada tema: Caderno de Estudos completo, Revisão Flash de uma página e Cartão de Plantão para consulta rápida.</p>
      <div class="filete"></div>
    </section>
    <div class="chamada-presc"><p>Modelos de prescrição de pronto atendimento com doses calculadas pelo peso.</p>
      <a class="botao" href="prescricoes.html">Prescrições de plantão</a></div>
    <p class="contagem-temas">${prontos.length} de ${temas.length} temas disponíveis</p>
    ${prontos.map(cardPronto).join("")}
    ${pendentes.length ? `
    <section class="proximos">
      <span class="rotulo">Próximos temas</span>
      <ul class="sessoes">${pendentes.map(linhaPendente).join("")}</ul>
    </section>` : ""}`;
}

render();
