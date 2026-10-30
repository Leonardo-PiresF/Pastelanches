/* Protótipo de pedidos da Pastelanches Vitória: cardápio do cliente + painel da loja, mesmo estado em memória. */
(() => {
'use strict';
const { CATS, MENU, BY_ID, PROMOS, BAIRROS } = MENU_DATA;

/* ===== Estado ===== */
const S = {
  mode:'mesa', view:'client', cat:'pasteis', q:'',
  cart:[], screen:'menu', sheet:null, myOrder:null,
  kitchen:true, out:new Set(), stockQ:'',
  orders:[], seq:412, fresh:null, msgOpen:{}
};
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);
const ago = t => { const m = Math.max(0, Math.round((Date.now()-t)/60000)); return m < 1 ? 'agora' : 'há ' + m + ' min'; };

const STEPS = {
  mesa:['Recebido','Em preparo','Pronto, já vai para a mesa','Entregue'],
  retirada:['Recebido','Em preparo','Pronto para retirar no balcão','Retirado'],
  delivery:['Recebido','Em preparo','Saiu para entrega','Entregue']
};
const ORIGIN = o => o.origin === 'mesa' ? 'Mesa ' + o.mesa + ' · ' + o.area : o.origin === 'delivery' ? 'Delivery · ' + o.bairro : 'Retirada';

/* Pedidos de exemplo para o painel não abrir vazio */
const seed = (origin, extra, lines, minsAgo, status) => {
  const sub = lines.reduce((a,l)=>a+l.unit*l.qty,0);
  const fee = extra.fee || 0;
  S.orders.push(Object.assign({id:++S.seq, code:'#0'+S.seq, origin, status, t:Date.now()-minsAgo*60000, sample:true, lines, sub, fee, total:sub+fee}, extra));
};
seed('mesa', {mesa:7, area:'Mirante', name:'Carla'}, [{name:'Pizza', detail:'Grande · Calabresa', unit:82, qty:1},{name:'Suco natural', detail:'Com leite · Maracujá', unit:10, qty:2}], 14, 1);
seed('delivery', {name:'Rafael', phone:'(75) 9 9812-0000', bairro:'BTN', addr:'Rua das Palmeiras, 120', pay:'Dinheiro', troco:'50', fee:6}, [{name:'Pastel especial 38', detail:'Camarão', unit:28, qty:2},{name:'Caldo de cana 500 ml', detail:'', unit:10, qty:1}], 9, 0);
seed('retirada', {name:'Joana'}, [{name:'Pacote de salgados pré-prontos', detail:'Coxinha', unit:17.5, qty:3}], 22, 2);

/* ===== Som de novo pedido (só depois de um clique) ===== */
let audio = null;
const beep = () => { try { audio = audio || new (window.AudioContext||window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audio.destination); g.gain.setValueAtTime(.18, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .5); o.start(); o.stop(audio.currentTime + .5); } catch(e){} };

let toastT;
const toast = msg => { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); };

/* ===== Cliente ===== */
const cartCount = () => S.cart.reduce((a,l)=>a+l.qty,0);
const cartSub = () => S.cart.reduce((a,l)=>a+l.unit*l.qty,0);
const itemPrice = m => m.price != null ? brl(m.price) : 'a partir de ' + brl(m.sizes[0][1]);
const findItem = id => BY_ID[id] || PROMOS.map(p=>p.item).find(i=>i.id===id);

function header(){
  const where = S.mode === 'mesa'
    ? '<span>Você está na <b>Mesa 12 · Salão</b></span><span>Paga no caixa</span>'
    : S.mode === 'delivery' ? '<span><b>Delivery</b> com motoboy da casa</span><span>40 a 60 min</span>'
    : '<span><b>Retirada</b> no balcão</span><span>Rua do Bom Conselho, 09</span>';
  return `<div class="c-head">
    <div class="brand"><img class="logo" src="assets/logo.webp" alt="" width="64" height="64">
      <div><h1>Pastelanches Vitória</h1><p>Aberto até 22h · ao lado da UNEB</p></div></div>
    <div class="where">${where}</div></div>
    ${S.kitchen ? '' : '<div class="closed-note"><b>Cozinha fechada agora.</b> Bebidas e pré-prontos seguem disponíveis.</div>'}`;
}

function menuScreen(){
  const q = S.q.trim().toLowerCase();
  const promos = PROMOS.filter(p=>p.on).map((p,i)=>`<button type="button" class="promo ${i%2?'dark':''}" data-open="${p.item.id}"><small>Promoção de hoje</small><strong>${esc(p.title)}</strong><span>${esc(p.text)}</span></button>`).join('');
  const match = m => !q || String(m.num||'') === q.replace(/^0+/,'') || m.name.toLowerCase().includes(q) || (m.desc||'').toLowerCase().includes(q) || (m.flavor && m.flavor.choices.some(c=>c.toLowerCase().includes(q)));
  const sections = CATS.map(c => {
    const items = MENU.filter(m => m.cat === c.id && match(m));
    if (!items.length) return '';
    return `<div class="section" id="sec-${c.id}"><h2>${c.name}</h2>${c.hint && !q ? `<p class="hint">${c.hint}</p>` : ''}
      ${items.map(m => { const off = S.out.has(m.id) || (!S.kitchen && m.cat !== 'bebidas');
        return `<button type="button" class="item" data-open="${m.id}" ${off?'disabled':''}>
          <div><div class="nm">${m.num?`<span class="num">${String(m.num).padStart(2,'0')}</span>`:''}<span>${esc(m.name)}${m.tag?`<span class="tag">${m.tag}</span>`:''}${off?'<span class="tag off">Em falta</span>':''}</span></div>${m.desc?`<div class="ds">${esc(m.desc)}</div>`:''}</div>
          <div class="pr money">${itemPrice(m)}</div></button>`; }).join('')}</div>`;
  }).join('');
  return header() + (promos ? `<div class="promos">${promos}</div>` : '') +
    `<div class="search"><input type="search" id="q" placeholder="Busque pelo número (ex: 38) ou ingrediente" value="${esc(S.q)}" aria-label="Buscar no cardápio"></div>
     <nav class="cats" aria-label="Categorias">${CATS.map(c=>`<button type="button" data-cat="${c.id}" aria-pressed="${S.cat===c.id}">${c.name}</button>`).join('')}</nav>
     ${sections || '<div class="section"><p class="hint">Nada encontrado. Tente outro número ou ingrediente.</p></div>'}
     <div class="spacer"></div>
     ${cartCount() ? `<button type="button" class="cartbar" data-go="checkout"><span><span class="qty">${cartCount()}</span>Ver pedido</span><span class="money">${brl(cartSub())}</span></button>` : ''}
     ${S.sheet ? sheet() : ''}`;
}

function sheet(){
  const m = findItem(S.sheet.id), s = S.sheet;
  const unit = m.sizes ? m.sizes[s.size][1] : m.price;
  return `<div class="sheet-wrap" data-close="1"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(m.name)}">
    <h3>${m.num?String(m.num).padStart(2,'0')+' · ':''}${esc(m.name)}</h3>${m.desc?`<p class="ds">${esc(m.desc)}</p>`:''}
    ${m.sizes ? `<div class="opt-group"><span>Tamanho</span><div class="chips">${m.sizes.map((z,i)=>`<button type="button" data-size="${i}" aria-pressed="${s.size===i}">${z[0]} · ${brl(z[1])}</button>`).join('')}</div></div>` : ''}
    ${m.flavor ? `<div class="opt-group"><span>${m.flavor.label}</span><div class="chips">${m.flavor.choices.map((c,i)=>`<button type="button" data-flavor="${i}" aria-pressed="${s.flavor===i}">${esc(c)}</button>`).join('')}</div></div>` : ''}
    <label class="opt-group"><span>Observação</span><textarea id="obs" rows="2" placeholder="Ex: sem azeitona, bem passado">${esc(s.obs)}</textarea></label>
    <div class="row"><div class="stepper"><button type="button" data-qty="-1" aria-label="Diminuir">−</button><output>${s.qty}</output><button type="button" data-qty="1" aria-label="Aumentar">+</button></div>
      <button type="button" class="btn wide" data-add="1" ${m.flavor && s.flavor==null?'disabled':''}><span>Adicionar</span><span class="money">${brl(unit*s.qty)}</span></button></div>
    <button type="button" class="btn ghost" data-close="1">Voltar ao cardápio</button>
  </div></div>`;
}

function checkoutScreen(){
  const sub = cartSub();
  const fee = S.mode === 'delivery' && S.form.bairro !== '' ? BAIRROS[S.form.bairro][1] : 0;
  const f = S.form;
  const fields = S.mode === 'mesa'
    ? `<label>Seu nome<input id="f-name" value="${esc(f.name)}" autocomplete="given-name" placeholder="Para chamar quando ficar pronto"></label>`
    : `<label>Seu nome<input id="f-name" value="${esc(f.name)}" autocomplete="given-name"></label>
       <label>WhatsApp<input id="f-phone" value="${esc(f.phone)}" inputmode="tel" autocomplete="tel" placeholder="(75) 9 0000-0000"></label>
       ${S.mode === 'delivery' ? `
       <label>Bairro<select id="f-bairro"><option value="">Escolha o bairro</option>${BAIRROS.map((b,i)=>`<option value="${i}" ${String(f.bairro)===String(i)?'selected':''}>${b[0]} · taxa ${brl(b[1])}</option>`).join('')}</select></label>
       <label>Endereço<input id="f-addr" value="${esc(f.addr)}" autocomplete="street-address" placeholder="Rua, número e referência"></label>
       <label>Pagamento na entrega<select id="f-pay">${['Pix','Dinheiro','Cartão'].map(p=>`<option ${f.pay===p?'selected':''}>${p}</option>`).join('')}</select></label>
       ${f.pay==='Dinheiro'?`<label>Troco para quanto?<input id="f-troco" value="${esc(f.troco)}" inputmode="decimal" placeholder="Ex: 50"></label>`:''}` : ''}`;
  const ready = f.name.trim() && (S.mode === 'mesa' || f.phone.trim()) && (S.mode !== 'delivery' || (f.bairro !== '' && f.addr.trim()));
  return header() + `<div class="page">
    <button type="button" class="back" data-go="menu">← Continuar escolhendo</button>
    <h2>Seu pedido</h2>
    <div class="lines">${S.cart.map((l,i)=>`<div class="line"><span class="q">${l.qty}x</span><div>${esc(l.name)}${l.detail?`<small>${esc(l.detail)}</small>`:''}${l.obs?`<small>Obs: ${esc(l.obs)}</small>`:''}<button type="button" class="rm" data-rm="${i}">Remover</button></div><span class="money">${brl(l.unit*l.qty)}</span></div>`).join('')}</div>
    <div class="totals"><div><span>Subtotal</span><span class="money">${brl(sub)}</span></div>
      ${S.mode==='delivery'?`<div><span>Entrega</span><span class="money">${fee?brl(fee):'escolha o bairro'}</span></div>`:''}
      <div class="big"><span>Total</span><span class="money">${brl(sub+fee)}</span></div></div>
    <div class="form">${fields}</div>
    <button type="button" class="btn" data-send="1" ${ready?'':'disabled'}>${S.mode==='mesa'?'Enviar para a cozinha':'Fazer pedido'}</button>
    ${S.mode==='mesa'?'<p class="demo-tag">O pagamento continua no caixa, como hoje.</p>':''}
  </div>`;
}

function statusScreen(){
  const o = S.orders.find(x => x.id === S.myOrder);
  if (!o) return menuScreen();
  const steps = STEPS[o.origin];
  return header() + `<div class="page">
    <div class="status-hero"><span class="side-label">Pedido enviado</span><span class="code">${o.code}</span>
      <span>${esc(ORIGIN(o))} · <b class="money">${brl(o.total)}</b></span></div>
    <div class="steps">${steps.map((s,i)=>`<div class="step ${i<o.status?'done':i===o.status?'now':''}"><span class="dot" aria-hidden="true"></span><div><b>${s}</b>${i===o.status?'<small>Atualiza sozinho, não precisa chamar ninguém</small>':''}</div></div>`).join('')}</div>
    ${o.origin==='mesa' && o.status<3 ? '<button type="button" class="btn ghost" data-go="menu">Pedir mais alguma coisa</button>' : ''}
    <button type="button" class="btn dark" data-new="1">Fazer outro pedido</button>
  </div>`;
}

function renderClient(){
  const sc = $('screen'), y = sc.scrollTop;
  const focusId = document.activeElement && document.activeElement.id;
  const pos = focusId && document.activeElement.selectionStart;
  sc.innerHTML = S.screen === 'checkout' ? checkoutScreen() : S.screen === 'status' ? statusScreen() : menuScreen();
  sc.scrollTop = y;
  if (focusId && $(focusId)) { const el = $(focusId); el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch(e){} }
  document.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
}

/* ===== Painel ===== */
function orderCard(o){
  const steps = STEPS[o.origin];
  const next = o.status === 0 ? 'Aceitar e preparar' : o.status === 1 ? (o.origin==='delivery'?'Saiu para entrega':'Marcar pronto') : 'Finalizar';
  const wpp = `Olá, ${o.name}! Recebemos seu pedido ${o.code} na Pastelanches Vitória. Total ${brl(o.total)}. Já está sendo preparado.`;
  const moto = o.origin==='delivery' ? `Entrega ${o.code}\n${o.name} · ${o.phone}\n${o.addr} · ${o.bairro}\nCobrar: ${brl(o.total)} (${o.pay}${o.troco?', troco para R$ '+o.troco:''})` : '';
  return `<article class="order ${S.fresh===o.id?'fresh':''}">
    <div class="o-head"><span class="o-code">${o.code}</span><span class="chip ${o.origin}">${esc(ORIGIN(o))}</span></div>
    <div class="o-meta">${esc(o.name)} · ${ago(o.t)}${o.sample?' · <span class="chip sample">exemplo</span>':''}</div>
    <ul class="o-lines">${o.lines.map(l=>`<li><b>${l.qty}x</b> ${esc(l.name)}${l.detail?` <small>${esc(l.detail)}</small>`:''}${l.obs?`<div class="o-obs">Obs: ${esc(l.obs)}</div>`:''}</li>`).join('')}</ul>
    <div class="o-foot"><b class="money">${brl(o.total)}</b><span class="o-meta">${o.origin==='delivery'?esc(o.pay):'Paga no caixa'}</span></div>
    <div class="o-actions">
      <button type="button" class="btn ${o.status===1?'ok':''}" data-adv="${o.id}">${next}</button>
      ${o.origin!=='mesa'?`<button type="button" class="btn ghost" data-msg="${o.id}:w">Confirmação WhatsApp</button>`:''}
      ${o.origin==='delivery'?`<button type="button" class="btn ghost" data-msg="${o.id}:m">Mensagem p/ motoboy</button>`:''}
    </div>
    ${S.msgOpen[o.id] ? `<pre class="msg">${esc(S.msgOpen[o.id]==='m'?moto:wpp)}</pre><button type="button" class="btn ghost" data-copy="${o.id}">Copiar texto</button>` : ''}
  </article>`;
}

function renderPanel(){
  const live = S.orders.filter(o => o.status < 3);
  const cols = [[0,'Novos'],[1,'Em preparo'],[2,'Prontos e a caminho']];
  $('board').innerHTML = cols.map(([st,t]) => { const list = live.filter(o=>o.status===st).sort((a,b)=>b.t-a.t);
    return `<div class="col"><h3>${t}<span>${list.length}</span></h3>${list.length?list.map(orderCard).join(''):'<p class="empty">Nenhum pedido aqui.</p>'}</div>`; }).join('');
  const sum = k => S.orders.filter(o=>o.origin===k).reduce((a,o)=>a+o.total,0);
  $('stats').innerHTML = [['Pedidos hoje', S.orders.length],['Mesa', brl(sum('mesa'))],['Delivery', brl(sum('delivery'))],['Retirada', brl(sum('retirada'))]]
    .map(([k,v])=>`<div class="stat"><small>${k}</small><b class="money">${v}</b></div>`).join('');
  const q = S.stockQ.trim().toLowerCase();
  $('stock').innerHTML = MENU.filter(m => !q || m.name.toLowerCase().includes(q) || String(m.num||'')===q.replace(/^0+/,''))
    .map(m=>`<label><span>${m.num?String(m.num).padStart(2,'0')+' · ':''}${esc(m.name)}</span><input type="checkbox" data-stock="${m.id}" ${S.out.has(m.id)?'':'checked'} aria-label="${esc(m.name)} disponível"></label>`).join('');
  $('promoAdmin').innerHTML = PROMOS.map(p=>`<label class="switch"><input type="checkbox" data-promo="${p.id}" ${p.on?'checked':''}> ${esc(p.title)}</label>`).join('');
  const n = live.filter(o=>o.status===0).length, tc = $('tabCount');
  tc.hidden = !n; tc.textContent = n;
}

const render = () => { renderClient(); renderPanel(); };

/* ===== Ações ===== */
S.form = {name:'', phone:'', bairro:'', addr:'', pay:'Pix', troco:''};

document.addEventListener('click', e => {
  const b = e.target.closest('button, [data-close]');
  if (!b) return;
  const d = b.dataset;
  if (d.mode){ S.mode = d.mode; S.screen = S.screen==='status' ? 'menu' : S.screen; S.sheet = null; render(); return; }
  if (d.view){ S.view = d.view; document.body.dataset.view = d.view; document.querySelectorAll('.tabs button').forEach(x=>x.setAttribute('aria-pressed', x.dataset.view===d.view)); window.scrollTo(0,0); return; }
  if (d.cat){ S.cat = d.cat; S.q=''; renderClient(); const sec = document.getElementById('sec-'+d.cat); if (sec) { const sc=$('screen'); if (sc.scrollHeight > sc.clientHeight) sc.scrollTop = sec.offsetTop - 60; else sec.scrollIntoView({block:'start'}); } return; }
  if (d.open){ S.sheet = {id:d.open, size:0, flavor:null, qty:1, obs:''}; renderClient(); return; }
  if (d.close && e.target === b){ S.sheet = null; renderClient(); return; }
  if (d.size){ S.sheet.size = +d.size; renderClient(); return; }
  if (d.flavor){ S.sheet.flavor = +d.flavor; renderClient(); return; }
  if (d.qty){ S.sheet.qty = Math.max(1, S.sheet.qty + +d.qty); renderClient(); return; }
  if (d.add){ const m = findItem(S.sheet.id), s = S.sheet;
    const detail = [m.sizes?m.sizes[s.size][0]:'', m.flavor?m.flavor.choices[s.flavor]:''].filter(Boolean).join(' · ');
    const name = m.num ? 'Pastel especial ' + String(m.num).padStart(2,'0') : m.name;
    S.cart.push({name, detail:m.num? m.name : detail, unit: m.sizes?m.sizes[s.size][1]:m.price, qty:s.qty, obs:s.obs.trim()});
    S.sheet = null; renderClient(); toast(name + ' adicionado'); return; }
  if (d.go){ S.screen = d.go; renderClient(); $('screen').scrollTop = 0; return; }
  if (d.rm){ S.cart.splice(+d.rm,1); if(!S.cart.length) S.screen='menu'; renderClient(); return; }
  if (d.send){ const f = S.form, sub = cartSub(), fee = S.mode==='delivery'?BAIRROS[f.bairro][1]:0;
    const o = {id:++S.seq, code:'#0'+S.seq, origin:S.mode, status:0, t:Date.now(), name:f.name.trim(), lines:S.cart.slice(), sub, fee, total:sub+fee};
    if (S.mode==='mesa'){ o.mesa = 12; o.area = 'Salão'; }
    else { o.phone = f.phone.trim(); }
    if (S.mode==='delivery'){ o.bairro = BAIRROS[f.bairro][0]; o.addr = f.addr.trim(); o.pay = f.pay; o.troco = f.pay==='Dinheiro'?f.troco.trim():''; }
    S.orders.push(o); S.myOrder = o.id; S.cart = []; S.screen = 'status'; S.fresh = o.id;
    render(); $('screen').scrollTop = 0; beep(); toast('Pedido ' + o.code + ' chegou no painel'); return; }
  if (d.new){ S.screen = 'menu'; S.myOrder = null; renderClient(); return; }
  if (d.adv){ const o = S.orders.find(x=>x.id===+d.adv); o.status++; S.fresh = null; delete S.msgOpen[o.id]; render(); toast(o.code + ': ' + STEPS[o.origin][Math.min(o.status,3)]); return; }
  if (d.msg){ const [id,k] = d.msg.split(':'); S.msgOpen[id] = S.msgOpen[id]===k ? null : k; renderPanel(); return; }
  if (d.copy){ const pre = b.previousElementSibling, txt = pre.textContent;
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Texto selecionado, é só copiar'); };
    try { navigator.clipboard.writeText(txt).then(()=>toast('Texto copiado'), fallback); } catch(err){ fallback(); } return; }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q'){ S.q = t.value; renderClient(); return; }
  if (t.id === 'obs'){ S.sheet.obs = t.value; return; }
  if (t.id === 'stockSearch'){ S.stockQ = t.value; renderPanel(); return; }
  const map = {'f-name':'name','f-phone':'phone','f-addr':'addr','f-troco':'troco'};
  if (map[t.id]){ S.form[map[t.id]] = t.value; const btn = document.querySelector('[data-send]');
    const f = S.form, ok = f.name.trim() && (S.mode==='mesa'||f.phone.trim()) && (S.mode!=='delivery'||(f.bairro!==''&&f.addr.trim()));
    if (btn) btn.disabled = !ok; }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'f-bairro'){ S.form.bairro = t.value; renderClient(); return; }
  if (t.id === 'f-pay'){ S.form.pay = t.value; renderClient(); return; }
  if (t.id === 'kitchen'){ S.kitchen = t.checked; renderClient(); toast(t.checked ? 'Cozinha aberta no cardápio' : 'Cardápio avisa que a cozinha fechou'); return; }
  if (t.dataset.stock){ t.checked ? S.out.delete(t.dataset.stock) : S.out.add(t.dataset.stock); renderClient(); toast(t.checked ? 'Voltou ao cardápio' : 'Marcado como em falta'); return; }
  if (t.dataset.promo){ PROMOS.find(p=>p.id===t.dataset.promo).on = t.checked; renderClient(); return; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet){ S.sheet = null; renderClient(); } });

setInterval(renderPanel, 30000);
document.body.dataset.view = 'client';
document.querySelector('.tabs [data-view="client"]').setAttribute('aria-pressed','true');
document.querySelector('.tabs [data-view="panel"]').setAttribute('aria-pressed','false');
render();
})();
