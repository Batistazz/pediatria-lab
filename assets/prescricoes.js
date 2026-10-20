/* Prescrições de plantão · Batistaz — calculadora por peso e idade, sem servidor. */
"use strict";

const escP = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v, casas = 1) => Number(v.toFixed(casas)).toLocaleString("pt-BR", { maximumFractionDigits: casas });
const estado = { peso: null, meses: null, escolhas: {}, concentracao: {}, aberto: null, busca: "" };
try { Object.assign(estado, JSON.parse(localStorage.getItem("presc-estado") || "{}"), { aberto: null }); } catch (e) { /* sem storage */ }
const salvar = () => { try { localStorage.setItem("presc-estado", JSON.stringify({ peso: estado.peso, meses: estado.meses })); } catch (e) { /* ok */ } };

/* Arredonda o volume: 0,1 mL abaixo de 2 mL; 0,5 mL acima. */
const arredMl = (v) => (v < 2 ? Math.round(v * 10) / 10 : Math.round(v * 2) / 2);

function restricao(item, ctx) {
  if (item.idadeMin != null && ctx.meses < item.idadeMin) return `Não indicado abaixo de ${item.idadeMin} meses.`;
  if (item.menorQue != null && ctx.meses >= item.menorQue) return `Acima de ${item.menorQue / 12} anos: ver o caderno.`;
  if (item.pesoMin != null && ctx.peso <= item.pesoMin) return `Só acima de ${item.pesoMin} kg.`;
  if (item.pesoMax != null && ctx.peso > item.pesoMax) return `Só até ${item.pesoMax} kg.`;
  if (item.limitePeso != null && ctx.peso > item.limitePeso) return `Acima de ${item.limitePeso} kg: usar a dose do protocolo do serviço (a fonte não traz teto por dose).`;
  return null;
}

function apresentacao(item, chave) {
  const lista = item.ap || [];
  const escolhida = estado.concentracao[chave];
  if (escolhida && escolhida.outra) return escolhida.c > 0 ? { r: `${num(escolhida.c, 2)} MG/ML`, c: escolhida.c } : null;
  if (escolhida && lista[escolhida.i]) return lista[escolhida.i];
  return lista[0] || null;
}

/* Devolve { linha, detalhe, aviso } para o item, ou { bloqueio }. */
function calcular(item, ctx, chave) {
  const bloqueio = restricao(item, ctx);
  if (bloqueio) return { bloqueio };
  if (item.fixo) return { linha: item.fixo(ctx), detalhe: "" };
  const ap = apresentacao(item, chave);
  let d = item.dose, freq = item.freq;
  if (ap && ap.bd && d.mgkgdia && d.vezes > 2) { d = { ...d, vezes: 2 }; freq = "DE 12 EM 12 HORAS"; }  // formulação BD: 12/12 h [AIDPI]
  const sufixo = [freq, item.dur].filter(Boolean).join(" ");
  if (d.gotasKg) {
    let g = Math.max(1, d.arredBaixo ? Math.floor(ctx.peso * d.gotasKg) : Math.round(ctx.peso * d.gotasKg));
    if (d.maxGotas) g = Math.min(g, d.maxGotas);
    return { linha: `DAR ${g} ${g === 1 ? "GOTA" : "GOTAS"} ${sufixo}`, detalhe: `${num(g * ap.mgGota)} mg/dose (${num(g * ap.mgGota / ctx.peso)} mg/kg)` };
  }
  if (d.azitroDia1) {
    const m1 = ctx.peso * d.azitroDia1, m2 = ctx.peso * d.azitroDepois;
    if (!ap) return { linha: `DAR ${num(m1, 1)} MG NO 1º DIA E DEPOIS ${num(m2, 1)} MG UMA VEZ AO DIA POR MAIS 4 DIAS`, detalhe: "" };
    const v1 = arredMl(m1 / ap.c), v2 = arredMl(m2 / ap.c);
    return { linha: `DAR ${num(v1)} ML NO 1º DIA. DEPOIS, DAR ${num(v2)} ML UMA VEZ AO DIA POR MAIS 4 DIAS`,
             detalhe: `${num(v1 * ap.c, 0)} mg no 1º dia; ${num(v2 * ap.c, 0)} mg/dia depois` };
  }
  let mgDose, teto = "";
  if (d.mgkgdia) {
    let dia = ctx.peso * d.mgkgdia;
    const maxDia = d.maxDiaFn ? d.maxDiaFn(ctx) : d.maxDia;
    if (maxDia && dia > maxDia) { dia = maxDia; teto = ` (teto de ${num(maxDia, 0)} mg/dia)`; }
    mgDose = dia / d.vezes;
  } else {
    mgDose = ctx.peso * d.mgkgdose;
  }
  if (d.maxDose && mgDose > d.maxDose) { mgDose = d.maxDose; teto = ` (teto de ${num(d.maxDose, 0)} mg/dose)`; }
  if (!ap) return { linha: `DAR ${num(mgDose, 1)} MG ${sufixo}`, detalhe: `${num(mgDose, 1)} mg/dose${teto}`, aviso: "Escolha ou informe a concentração para calcular o volume." };
  const ml = arredMl(mgDose / ap.c);
  const mgReal = ml * ap.c;
  const porKgDia = d.mgkgdia ? `${num(mgReal * d.vezes / ctx.peso)} mg/kg/dia` : `${num(mgReal / ctx.peso, 2)} mg/kg/dose`;
  const base = ap.base ? ` de ${ap.base}` : "";
  return { linha: `DAR ${num(ml)} ML ${sufixo}`, detalhe: `${num(mgReal, 1)} mg${base}/dose · ${porKgDia}${teto}` };
}

const chaveDe = (p, b, i) => `${p.id}:${b}:${i}`;

function selecionados(p, b, bloco) {
  const k = `${p.id}:${b}`;
  if (bloco.modo === "um") {
    let i = estado.escolhas[k];
    if (i == null) {  // padrão: a primeira opção que não esteja bloqueada para esta criança
      const ctx = estado.peso > 0 && estado.meses != null ? { peso: estado.peso, meses: estado.meses } : null;
      i = ctx ? bloco.itens.findIndex((it) => !restricao(it, ctx)) : 0;
    }
    return i === -1 ? [] : [i];
  }
  const marc = estado.escolhas[k];
  if (marc) return marc;
  return bloco.opcional ? [] : bloco.itens.map((_, i) => i);
}

function textoPrescricao(p, ctx) {
  const porVia = new Map();
  p.blocos.forEach((bloco, b) => {
    selecionados(p, b, bloco).forEach((i) => {
      const it = bloco.itens[i], r = calcular(it, ctx, chaveDe(p, b, i));
      if (r.bloqueio) return;
      const via = it.via || bloco.via || "USO ORAL";
      const ap = apresentacao(it, chaveDe(p, b, i));
      const nome = ap && !it.fixo ? `${it.nome} ${ap.r}` : it.nome;
      if (!porVia.has(via)) porVia.set(via, []);
      porVia.get(via).push(`${nome} ${"-".repeat(Math.max(4, 44 - nome.length))} ${it.qtd || ""}`.trim() + `\n${r.linha}`);
    });
  });
  return [...porVia].map(([via, linhas]) => `${via}\n` + linhas.map((l, n) => `${n + 1}) ${l}`).join("\n\n")).join("\n\n");
}

function fontesNo(texto) {
  return escP(texto).replace(/\[([A-Z0-9-]+(?:\] \[[A-Z0-9-]+)*)\]/g, (m) => `<span class="f">${m}</span>`);
}

function cartaoItem(p, b, bloco, it, i, ctx) {
  const chave = chaveDe(p, b, i);
  const sel = selecionados(p, b, bloco).includes(i);
  const r = ctx ? calcular(it, ctx, chave) : null;
  const tipo = bloco.modo === "um" ? "radio" : "checkbox";
  const opcoesAp = (it.ap || []).map((a, j) => `<option value="${j}" ${(estado.concentracao[chave]?.i ?? 0) === j && !estado.concentracao[chave]?.outra ? "selected" : ""}>${escP(a.r)}</option>`).join("");
  const precisaAp = !it.fixo && !(it.dose && it.dose.gotasKg);
  const outra = estado.concentracao[chave]?.outra;
  return `
    <label class="presc-item ${r && r.bloqueio ? "bloqueado" : ""}">
      <input type="${tipo}" name="${p.id}:${b}" data-acao="escolher" data-p="${p.id}" data-b="${b}" data-i="${i}" ${sel ? "checked" : ""} ${r && r.bloqueio ? "disabled" : ""}>
      <span class="corpo">
        <b>${escP(it.nome)}</b>${it.via ? ` <small>${escP(it.via.toLowerCase())}</small>` : ""}
        ${precisaAp ? `<span class="ap">
          <select data-acao="ap" data-chave="${chave}">${opcoesAp}<option value="outra" ${outra || !(it.ap || []).length ? "selected" : ""}>outra concentração…</option></select>
          ${outra || !(it.ap || []).length ? `<input type="number" step="0.01" min="0" inputmode="decimal" placeholder="mg/mL" value="${outra && estado.concentracao[chave].c ? estado.concentracao[chave].c : ""}" data-acao="conc" data-chave="${chave}">` : ""}
        </span>` : ""}
        ${r ? (r.bloqueio ? `<span class="calc aviso">${escP(r.bloqueio)}</span>`
            : `<span class="calc">${escP(r.linha)}</span>${r.detalhe ? `<small class="det">${escP(r.detalhe)}</small>` : ""}${r.aviso ? `<small class="det aviso">${escP(r.aviso)}</small>` : ""}`)
          : `<span class="calc vazio">Informe peso e idade para calcular.</span>`}
        ${it.nota ? `<small class="nota">${fontesNo(it.nota)}</small>` : ""}
        <small class="nota"><span class="f">[${escP(it.fonte)}]</span></small>
      </span>
    </label>`;
}

function cartaoSituacao(p, ctx) {
  const aberto = estado.aberto === p.id;
  return `
    <article class="presc ${aberto ? "aberto" : ""}" id="p-${p.id}">
      <button class="presc-titulo" data-acao="abrir" data-p="${p.id}" aria-expanded="${aberto}">
        <span>${escP(p.titulo)}</span><span class="seta">${aberto ? "−" : "+"}</span>
      </button>
      ${aberto ? `<div class="presc-corpo">
        <ul class="notas">${p.notas.map((n) => `<li>${fontesNo(n)}</li>`).join("")}</ul>
        ${p.blocos.map((bloco, b) => `
          <fieldset class="bloco">
            <legend>${escP(bloco.rotulo)}${bloco.via ? ` · <i>${escP(bloco.via.toLowerCase())}</i>` : ""}</legend>
            ${bloco.itens.map((it, i) => cartaoItem(p, b, bloco, it, i, ctx)).join("")}
            ${bloco.modo === "um" && bloco.opcional !== false ? `<label class="presc-item nenhum"><input type="radio" name="${p.id}:${b}" data-acao="escolher" data-p="${p.id}" data-b="${b}" data-i="-1" ${selecionados(p, b, bloco).length === 0 ? "checked" : ""}><span class="corpo"><i>Nenhum</i></span></label>` : ""}
          </fieldset>`).join("")}
        ${ctx ? `<div class="saida"><pre>${escP(textoPrescricao(p, ctx))}</pre>
          <button class="botao" data-acao="copiar" data-p="${p.id}">Copiar prescrição</button></div>` : ""}
      </div>` : ""}
    </article>`;
}

function render() {
  const ctx = estado.peso > 0 && estado.meses != null ? { peso: estado.peso, meses: estado.meses } : null;
  const busca = estado.busca.trim().toLowerCase();
  const lista = window.PRESCRICOES.filter((p) => !busca || (p.titulo + " " + p.grupo).toLowerCase().includes(busca));
  const grupos = [...new Set(lista.map((p) => p.grupo))];
  document.getElementById("lista").innerHTML = grupos.map((g) => `
    <h2 class="grupo">${escP(g)}</h2>
    ${lista.filter((p) => p.grupo === g).map((p) => cartaoSituacao(p, ctx)).join("")}`).join("")
    || `<p class="vazio">Nada encontrado.</p>`;
}

function renderModelos() {
  document.getElementById("modelos").innerHTML = window.MODELOS_TEXTO.map((m) => `
    <details class="modelo"><summary>${escP(m.titulo)}</summary>
      <pre>${escP(m.texto)}</pre>
      <button class="botao claro" data-acao="copiar-modelo" data-m="${m.id}">Copiar</button>
    </details>`).join("");
  document.getElementById("fontes").innerHTML = Object.entries(window.FONTES_PRESC)
    .map(([k, v]) => `<li><span class="f">[${escP(k)}]</span> ${escP(v)}</li>`).join("");
}

async function copiar(texto, botao) {
  try { await navigator.clipboard.writeText(texto); }
  catch (e) {
    const t = document.createElement("textarea"); t.value = texto; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e2) { /* sem cópia */ } t.remove();
  }
  const antes = botao.textContent; botao.textContent = "Copiado"; setTimeout(() => { botao.textContent = antes; }, 1400);
}

function lerIdade() {
  const a = parseFloat(document.getElementById("anos").value.replace(",", ".")) || 0;
  const m = parseFloat(document.getElementById("meses").value.replace(",", ".")) || 0;
  const vazio = !document.getElementById("anos").value && !document.getElementById("meses").value;
  estado.meses = vazio ? null : a * 12 + m;
}

document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.id === "peso") { estado.peso = parseFloat(el.value.replace(",", ".")) || null; salvar(); render(); }
  else if (el.id === "anos" || el.id === "meses") { lerIdade(); salvar(); render(); }
  else if (el.id === "busca") { estado.busca = el.value; render(); }
  else if (el.dataset.acao === "conc") {
    const c = parseFloat(el.value.replace(",", "."));
    estado.concentracao[el.dataset.chave] = { outra: true, c: c > 0 ? c : null };
    if (!(c > 0)) delete estado.concentracao[el.dataset.chave].c;
    const pos = el.selectionStart; render();
    const novo = document.querySelector(`input[data-chave="${el.dataset.chave}"]`); if (novo) { novo.focus(); try { novo.setSelectionRange(pos, pos); } catch (e) { /* number */ } }
  }
});

document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.acao === "escolher") {
    const p = window.PRESCRICOES.find((x) => x.id === el.dataset.p), b = +el.dataset.b, i = +el.dataset.i, bloco = p.blocos[b];
    const k = `${p.id}:${b}`;
    if (bloco.modo === "um") estado.escolhas[k] = i;
    else {
      const atual = new Set(selecionados(p, b, bloco));
      el.checked ? atual.add(i) : atual.delete(i);
      estado.escolhas[k] = [...atual].sort();
    }
    render();
  } else if (el.dataset.acao === "ap") {
    estado.concentracao[el.dataset.chave] = el.value === "outra" ? { outra: true } : { i: +el.value };
    render();
  }
});

document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-acao]");
  if (!el) return;
  if (el.dataset.acao === "abrir") { estado.aberto = estado.aberto === el.dataset.p ? null : el.dataset.p; render(); }
  else if (el.dataset.acao === "copiar") {
    const p = window.PRESCRICOES.find((x) => x.id === el.dataset.p);
    copiar(textoPrescricao(p, { peso: estado.peso, meses: estado.meses }), el);
  } else if (el.dataset.acao === "copiar-modelo") {
    copiar(window.MODELOS_TEXTO.find((m) => m.id === el.dataset.m).texto, el);
  }
});

document.getElementById("peso").value = estado.peso ?? "";
if (estado.meses != null) { document.getElementById("anos").value = Math.floor(estado.meses / 12) || ""; document.getElementById("meses").value = Math.round(estado.meses % 12) || ""; }
render();
renderModelos();
