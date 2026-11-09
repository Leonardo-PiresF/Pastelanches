// Pedidos feitos neste aparelho. Sem cadastro: o histórico fica no navegador do cliente.
const CHAVE = 'pastelanches:meus-pedidos'
const LIMITE = 10
const EM_ANDAMENTO = 6 * 3600000

export function listarMeusPedidos() {
  try {
    return JSON.parse(window.localStorage.getItem(CHAVE)) ?? []
  } catch {
    return []
  }
}

export function guardarPedido(pedido) {
  try {
    const lista = [{ ...pedido, em: new Date().toISOString() }, ...listarMeusPedidos()].slice(0, LIMITE)
    window.localStorage.setItem(CHAVE, JSON.stringify(lista))
  } catch {
    // sem armazenamento: o cliente ainda tem o link da senha aberto
  }
}

export function pedidoEmAndamento() {
  const [ultimo] = listarMeusPedidos()
  return ultimo && Date.now() - new Date(ultimo.em).getTime() < EM_ANDAMENTO ? ultimo.codigo : null
}
