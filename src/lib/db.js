import { supabase, temSupabase } from './supabase.js'
import { AGENDA_PADRAO, BANNER_PADRAO, BAIRROS, PRODUTOS, PROMOCOES } from '../data/cardapio.js'
import { recalcularItens, somar } from './pedido.js'
import { diaDe, momento, somarDias } from './tempo.js'

// Camada única de dados. Com as variáveis do Supabase, usa o banco.
// Sem elas, roda em modo demonstração com tudo guardado no navegador.
export const modoDemo = !temSupabase

const CHAVE = 'pastelanches:demo-v3'
const EVENTO = 'pastelanches:mudou'

function lerDemo() {
  try {
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE))
    if (salvo) return salvo
  } catch {
    // dado corrompido: recomeça do catálogo inicial
  }
  return {
    produtos: PRODUTOS,
    promocoes: PROMOCOES,
    bairros: BAIRROS,
    loja: { id: 1, cozinha_aberta: true, agenda: AGENDA_PADRAO, banner: BANNER_PADRAO },
    datas_especiais: [],
    pedidos: []
  }
}

function gravarDemo(mudar, tabela) {
  const dados = lerDemo()
  mudar(dados)
  window.localStorage.setItem(CHAVE, JSON.stringify(dados))
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: tabela }))
  return dados
}

function falhou(error) {
  if (!error) return
  const msg = error.message || ''
  if (/fetch|network/i.test(msg)) throw new Error('Sem conexão com a loja agora. Tente de novo em instantes.')
  throw new Error(msg)
}

// ---------------------------------------------------------------
// Catálogo e configuração da loja
// ---------------------------------------------------------------
export async function carregarCatalogo() {
  if (modoDemo) {
    const { produtos, promocoes, bairros, loja, datas_especiais } = lerDemo()
    return { produtos, promocoes, bairros, loja, especiais: datas_especiais }
  }
  const [produtos, promocoes, bairros, loja, especiais] = await Promise.all([
    supabase.from('produtos').select('*').order('ordem'),
    supabase.from('promocoes').select('*').order('ordem'),
    supabase.from('bairros').select('*').order('nome'),
    supabase.from('loja').select('*').eq('id', 1).single(),
    supabase.from('datas_especiais').select('*').gte('data', diaDe()).order('data')
  ])
  ;[produtos, promocoes, bairros, loja, especiais].forEach((r) => falhou(r.error))
  return {
    produtos: produtos.data,
    promocoes: promocoes.data,
    bairros: bairros.data,
    loja: loja.data,
    especiais: especiais.data
  }
}

const trocarNaLista = (lista, chave, valor, novo) => {
  const i = lista.findIndex((x) => x[chave] === valor)
  if (i >= 0) lista[i] = { ...lista[i], ...novo }
  else lista.push(novo)
}

export async function salvarProduto(id, campos) {
  if (modoDemo) return void gravarDemo((d) => trocarNaLista(d.produtos, 'id', id, campos), 'produtos')
  falhou((await supabase.from('produtos').update(campos).eq('id', id)).error)
}

export async function salvarPromocao(promo) {
  if (modoDemo) return void gravarDemo((d) => trocarNaLista(d.promocoes, 'id', promo.id, promo), 'promocoes')
  falhou((await supabase.from('promocoes').upsert(promo)).error)
}

export async function removerPromocao(id) {
  if (modoDemo) return void gravarDemo((d) => { d.promocoes = d.promocoes.filter((p) => p.id !== id) }, 'promocoes')
  falhou((await supabase.from('promocoes').delete().eq('id', id)).error)
}

export async function salvarBairro(bairro) {
  if (modoDemo) return void gravarDemo((d) => trocarNaLista(d.bairros, 'nome', bairro.nome, bairro), 'bairros')
  falhou((await supabase.from('bairros').upsert(bairro)).error)
}

export async function removerBairro(nome) {
  if (modoDemo) return void gravarDemo((d) => { d.bairros = d.bairros.filter((b) => b.nome !== nome) }, 'bairros')
  falhou((await supabase.from('bairros').delete().eq('nome', nome)).error)
}

export async function salvarLoja(campos) {
  if (modoDemo) return void gravarDemo((d) => { d.loja = { ...d.loja, ...campos } }, 'loja')
  falhou((await supabase.from('loja').update(campos).eq('id', 1)).error)
}

export async function salvarDataEspecial(data) {
  if (modoDemo) return void gravarDemo((d) => trocarNaLista(d.datas_especiais, 'data', data.data, data), 'datas_especiais')
  falhou((await supabase.from('datas_especiais').upsert(data)).error)
}

export async function removerDataEspecial(data) {
  if (modoDemo) return void gravarDemo((d) => { d.datas_especiais = d.datas_especiais.filter((e) => e.data !== data) }, 'datas_especiais')
  falhou((await supabase.from('datas_especiais').delete().eq('data', data)).error)
}

// ---------------------------------------------------------------
// Pedido do cliente: só pelas funções do banco
// ---------------------------------------------------------------
function criarPedidoDemo(p) {
  const dados = lerDemo()
  if (!p.cliente?.nome?.trim()) throw new Error('informe o nome')
  if (p.tipo !== 'mesa' && String(p.cliente.telefone || '').replace(/\D/g, '').length < 10) throw new Error('informe um WhatsApp válido')
  if (p.tipo !== 'encomenda' && !dados.loja.cozinha_aberta) throw new Error('a cozinha está fechada agora')

  const itens = recalcularItens(p.itens, p.tipo, dados)
  let taxa = 0
  if (p.tipo === 'delivery') {
    const bairro = dados.bairros.find((b) => b.nome === p.entrega?.bairro)
    if (!bairro) throw new Error('bairro fora da área de entrega')
    taxa = bairro.taxa
  }
  if (p.tipo === 'encomenda') {
    const ocupados = dados.pedidos.filter((x) => x.tipo === 'encomenda' && x.status !== 'recusado' && x.retirada_em === p.retirada_em)
    if (ocupados.length >= dados.loja.agenda.limite) throw new Error('esse horário acabou de lotar, escolha outro')
  }

  const hoje = diaDe()
  const senha = dados.pedidos.filter((x) => diaDe(new Date(x.criado_em)) === hoje).reduce((m, x) => Math.max(m, x.senha), 0) + 1
  const codigo = `PL${crypto.randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase()}`
  const pedido = {
    id: crypto.randomUUID(),
    codigo,
    senha,
    tipo: p.tipo,
    status: 'novo',
    mesa: p.tipo === 'mesa' ? Number(p.mesa) || null : null,
    cliente: p.cliente,
    entrega: p.tipo === 'delivery' ? p.entrega : null,
    itens,
    totais: somar(itens, taxa),
    retirada_em: p.tipo === 'encomenda' ? p.retirada_em : null,
    observacoes: p.observacoes || null,
    motivo_recusa: null,
    criado_em: new Date().toISOString()
  }
  gravarDemo((d) => d.pedidos.unshift(pedido), 'pedidos')
  return { codigo, senha }
}

export async function criarPedido(payload) {
  if (modoDemo) return criarPedidoDemo(payload)
  const { data, error } = await supabase.rpc('criar_pedido', { p: payload })
  falhou(error)
  return data[0]
}

export async function statusPedido(codigo) {
  if (modoDemo) return lerDemo().pedidos.find((p) => p.codigo === codigo.toUpperCase()) ?? null
  const { data, error } = await supabase.rpc('status_pedido', { p_codigo: codigo })
  falhou(error)
  return data[0] ?? null
}

export async function horariosOcupados(de, ate) {
  if (modoDemo) {
    const fim = momento(somarDias(ate, 1), '00:00').getTime()
    const contagem = {}
    lerDemo().pedidos
      .filter((p) => p.tipo === 'encomenda' && p.status !== 'recusado' && new Date(p.retirada_em).getTime() < fim)
      .forEach((p) => { contagem[p.retirada_em] = (contagem[p.retirada_em] ?? 0) + 1 })
    return Object.entries(contagem).map(([retirada_em, qtd]) => ({ retirada_em, qtd }))
  }
  const { data, error } = await supabase.rpc('horarios_ocupados', { p_de: de, p_ate: ate })
  falhou(error)
  return data
}

// ---------------------------------------------------------------
// Painel: pedidos de ontem para cá e encomendas por vir
// ---------------------------------------------------------------
export async function listarPedidos() {
  const desde = momento(somarDias(diaDe(), -1), '00:00').toISOString()
  if (modoDemo) {
    return lerDemo().pedidos.filter((p) => p.criado_em >= desde || (p.retirada_em && p.retirada_em >= desde))
  }
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .or(`criado_em.gte.${desde},retirada_em.gte.${desde}`)
    .order('criado_em', { ascending: false })
    .limit(500)
  falhou(error)
  return data
}

export async function buscarPedido(codigo) {
  if (modoDemo) return lerDemo().pedidos.find((p) => p.codigo === codigo) ?? null
  const { data, error } = await supabase.from('pedidos').select('*').eq('codigo', codigo).maybeSingle()
  falhou(error)
  return data
}

export async function atualizarPedido(id, campos) {
  if (modoDemo) return void gravarDemo((d) => trocarNaLista(d.pedidos, 'id', id, campos), 'pedidos')
  falhou((await supabase.from('pedidos').update(campos).eq('id', id)).error)
}

// Avisa quando algo muda: no banco, pelo tempo real; na demonstração, entre abas.
export function assinar(tabelas, aoMudar) {
  if (modoDemo) {
    const local = (e) => tabelas.includes(e.detail) && aoMudar(e.detail)
    const outraAba = (e) => e.key === CHAVE && aoMudar(null)
    window.addEventListener(EVENTO, local)
    window.addEventListener('storage', outraAba)
    return () => {
      window.removeEventListener(EVENTO, local)
      window.removeEventListener('storage', outraAba)
    }
  }
  const canal = supabase.channel(`ao-vivo-${tabelas.join('-')}-${Math.random().toString(36).slice(2)}`)
  tabelas.forEach((table) =>
    canal.on('postgres_changes', { event: '*', schema: 'public', table }, () => aoMudar(table)))
  canal.subscribe()
  return () => supabase.removeChannel(canal)
}

// ---------------------------------------------------------------
// Sessão da equipe
// ---------------------------------------------------------------
const CHAVE_SESSAO = 'pastelanches:painel'
const SENHA_DEMO = import.meta.env.VITE_PAINEL_SENHA_DEMO || 'pastelanches'

export async function entrar(email, senha) {
  if (modoDemo) {
    if (senha !== SENHA_DEMO) throw new Error('Senha incorreta')
    window.sessionStorage.setItem(CHAVE_SESSAO, '1')
    return { demo: true }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message)
  return data.session
}

export async function sair() {
  if (modoDemo) return window.sessionStorage.removeItem(CHAVE_SESSAO)
  await supabase.auth.signOut()
}

export async function sessaoAtual() {
  if (modoDemo) return window.sessionStorage.getItem(CHAVE_SESSAO) ? { demo: true } : null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function aoMudarSessao(callback) {
  if (modoDemo) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(sessao))
  return () => data.subscription.unsubscribe()
}
