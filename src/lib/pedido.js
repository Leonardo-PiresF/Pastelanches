import { diaDe, diaDaSemana } from './tempo.js'

// Mesmas regras do criar_pedido no banco. A vitrine usa para mostrar o total;
// o modo demonstração usa para gravar. Com Supabase, o banco recalcula tudo.

export function valeHoje(promo, agora = new Date()) {
  const hoje = diaDe(agora)
  if (!promo.ativa) return false
  if (promo.data && promo.data !== hoje) return false
  return !promo.dias?.length || promo.dias.includes(diaDaSemana(hoje))
}

export const promocoesDeHoje = (promocoes, agora) =>
  promocoes.filter((p) => valeHoje(p, agora)).sort((a, b) => a.ordem - b.ordem)

// Promoções com data marcada que ainda não chegou: a vitrine anuncia, mas não vende.
export const promocoesFuturas = (promocoes, agora = new Date()) =>
  promocoes.filter((p) => p.ativa && p.data > diaDe(agora)).sort((a, b) => a.data.localeCompare(b.data))

export const precoDe = (produto, tamanho) =>
  produto.tamanhos ? produto.tamanhos.find((t) => t.nome === tamanho)?.preco ?? null : produto.preco

export const precoInicial = (produto) =>
  produto.tamanhos ? Math.min(...produto.tamanhos.map((t) => t.preco)) : produto.preco

export function somar(itens, taxa = 0) {
  const subtotal = itens.reduce((s, it) => s + it.preco * it.qtd, 0)
  return { subtotal, taxa, total: subtotal + taxa }
}

export function recalcularItens(entrada, tipo, { produtos, promocoes }, agora) {
  return entrada.map((item) => {
    const qtd = Math.max(1, Math.min(99, Number(item.qtd) || 1))
    let preco
    if (item.promocao_id) {
      const promo = promocoes.find((p) => p.id === item.promocao_id)
      if (!promo || !valeHoje(promo, agora)) throw new Error('essa promoção não vale hoje')
      preco = promo.preco
    } else {
      const produto = produtos.find((p) => p.id === item.produto_id && p.disponivel)
      if (!produto) throw new Error(`item indisponível: ${item.nome}`)
      if ((tipo === 'encomenda') !== (produto.catalogo === 'festa')) throw new Error('item fora do cardápio deste pedido')
      preco = precoDe(produto, item.tamanho)
      if (preco === null) throw new Error('tamanho inválido')
    }
    return {
      produto_id: item.produto_id ?? null,
      promocao_id: item.promocao_id ?? null,
      nome: String(item.nome).slice(0, 80),
      detalhe: item.detalhe ? String(item.detalhe).slice(0, 120) : null,
      obs: item.obs ? String(item.obs).slice(0, 200) : null,
      preco,
      qtd
    }
  })
}
