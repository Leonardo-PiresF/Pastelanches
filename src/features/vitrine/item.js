// Monta a linha do carrinho com o que o banco precisa para recalcular o preço.
export function itemDeProduto(produto, { tamanho = null, sabor = null, obs = '', qtd = 1, preco }) {
  const detalhe = [tamanho, sabor].filter(Boolean).join(', ')
  return {
    chave: [produto.id, tamanho, sabor, obs].join('|'),
    produto_id: produto.id,
    tamanho,
    nome: produto.numero ? `${String(produto.numero).padStart(2, '0')} ${produto.nome}` : produto.nome,
    detalhe: detalhe || null,
    obs: obs.trim() || null,
    preco,
    qtd,
    foto: produto.foto
  }
}

export function itemDePromocao(promo, { sabor = null, obs = '', qtd = 1 }) {
  return {
    chave: ['promo', promo.id, sabor, obs].join('|'),
    promocao_id: promo.id,
    nome: promo.titulo,
    detalhe: sabor,
    obs: obs.trim() || null,
    preco: promo.preco,
    qtd,
    foto: promo.foto
  }
}

export const paraEnvio = ({ produto_id, promocao_id, tamanho, nome, detalhe, obs, qtd }) =>
  ({ produto_id, promocao_id, tamanho, nome, detalhe, obs, qtd })
