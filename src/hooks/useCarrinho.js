import { useEffect, useReducer } from 'react'

// Um carrinho por contexto (cardápio ou encomenda), guardado na aba
// para não sumir se o cliente recarregar a página.
function reduzir(itens, acao) {
  switch (acao.tipo) {
    case 'adicionar': {
      const existe = itens.find((it) => it.chave === acao.item.chave)
      return existe
        ? itens.map((it) => (it.chave === acao.item.chave ? { ...it, qtd: Math.min(99, it.qtd + acao.item.qtd) } : it))
        : [...itens, acao.item]
    }
    case 'quantidade':
      return acao.qtd <= 0
        ? itens.filter((it) => it.chave !== acao.chave)
        : itens.map((it) => (it.chave === acao.chave ? { ...it, qtd: Math.min(99, acao.qtd) } : it))
    case 'esvaziar':
      return []
    default:
      return itens
  }
}

const ler = (chave) => {
  try {
    return JSON.parse(window.sessionStorage.getItem(chave)) ?? []
  } catch {
    return []
  }
}

export function useCarrinho(nome) {
  const chave = `pastelanches:carrinho:${nome}`
  const [itens, despachar] = useReducer(reduzir, chave, ler)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(chave, JSON.stringify(itens))
    } catch {
      // aba privada sem armazenamento: o carrinho vive só na memória
    }
  }, [chave, itens])

  return {
    itens,
    quantidade: itens.reduce((s, it) => s + it.qtd, 0),
    total: itens.reduce((s, it) => s + it.preco * it.qtd, 0),
    adicionar: (item) => despachar({ tipo: 'adicionar', item }),
    mudarQuantidade: (chave, qtd) => despachar({ tipo: 'quantidade', chave, qtd }),
    esvaziar: () => despachar({ tipo: 'esvaziar' })
  }
}
