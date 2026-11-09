import { LOJA } from './config.js'
import { diaDe, horaDe, rotuloDia } from './tempo.js'

export const brl = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const somenteDigitos = (s) => String(s || '').replace(/\D/g, '')

export function mascaraTelefone(s) {
  const d = somenteDigitos(s).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const linkWhatsApp = (numero, texto) => {
  const d = somenteDigitos(numero)
  return `https://wa.me/${d.startsWith('55') ? d : `55${d}`}?text=${encodeURIComponent(texto)}`
}

export function quando(iso) {
  const dia = diaDe(new Date(iso))
  const { semana, data } = rotuloDia(dia)
  return `${semana} ${data} às ${horaDe(iso)}`
}

export const TIPO = { mesa: 'Mesa', delivery: 'Delivery', retirada: 'Retirada', encomenda: 'Encomenda' }

export const tituloPedido = (p) => (p.tipo === 'mesa' && p.mesa ? `Mesa ${p.mesa}` : TIPO[p.tipo])

export const nomeItem = (it) => (it.detalhe ? `${it.nome} (${it.detalhe})` : it.nome)

const LARGURA = 32

function linhaValor(rotulo, valor) {
  const espaco = Math.max(1, LARGURA - rotulo.length - valor.length - 2)
  return `${rotulo} ${'.'.repeat(espaco)} ${valor}`
}

// Texto em formato de nota: vai para o WhatsApp da loja (plano B da impressão)
// e para o motoboy. Bloco monoespaçado para alinhar os valores.
export function notaPedido(p) {
  const L = [`*${LOJA.nome.toUpperCase()}*`, `*SENHA ${p.senha}* · ${tituloPedido(p)} · ${p.codigo}`]
  if (p.criado_em) L.push(quando(p.criado_em))
  L.push('', `*${p.cliente.nome}*`)
  if (p.cliente.telefone) L.push(p.cliente.telefone)
  if (p.entrega) {
    L.push(`${p.entrega.endereco}, ${p.entrega.bairro}`)
    L.push(`Pagamento: ${p.entrega.pagamento}${p.entrega.troco ? `, troco para ${p.entrega.troco}` : ''}`)
  }
  if (p.retirada_em) L.push(`Retirada: ${quando(p.retirada_em)}`)
  L.push('', '```')
  p.itens.forEach((it) => {
    L.push(`${it.qtd}x ${nomeItem(it)}`)
    if (it.obs) L.push(`   obs: ${it.obs}`)
    L.push(linhaValor('', brl(it.preco * it.qtd)))
  })
  L.push('-'.repeat(LARGURA))
  if (p.totais.taxa) L.push(linhaValor('Entrega', brl(p.totais.taxa)))
  L.push(linhaValor('TOTAL', brl(p.totais.total)))
  L.push('```')
  if (p.observacoes) L.push('', `Obs.: ${p.observacoes}`)
  return L.join('\n')
}

export function mensagemMotoboy(p) {
  const pagar = p.entrega.pagamento === 'Dinheiro' && p.entrega.troco
    ? `Dinheiro, levar troco para ${p.entrega.troco}`
    : p.entrega.pagamento
  return [
    `*Entrega · senha ${p.senha}*`,
    `${p.cliente.nome} · ${p.cliente.telefone}`,
    `${p.entrega.endereco}, ${p.entrega.bairro}`,
    `Cobrar ${brl(p.totais.total)} (${pagar})`
  ].join('\n')
}

export function mensagemCliente(p) {
  const nome = p.cliente.nome.split(' ')[0]
  if (p.status === 'recusado') {
    return `Olá, ${nome}. Aqui é da ${LOJA.nome}. Não conseguimos atender o pedido ${p.codigo}: ${p.motivo_recusa}. Nada foi cobrado.`
  }
  if (p.tipo === 'encomenda') {
    return `Olá, ${nome}. Aqui é da ${LOJA.nome}. Sua encomenda ${p.codigo} está confirmada para ${quando(p.retirada_em)}. Total ${brl(p.totais.total)}, pago na retirada.`
  }
  return `Olá, ${nome}. Aqui é da ${LOJA.nome}. Seu pedido (senha ${p.senha}) saiu para entrega.`
}
