import { useState } from 'react'
import Folha from './Folha.jsx'
import Icone from './Icone.jsx'
import { TIPO, brl, quando } from '../lib/formato.js'
import { listarMeusPedidos } from '../lib/meusPedidos.js'

function MeusPedidos({ aberta, aoFechar }) {
  const pedidos = aberta ? listarMeusPedidos() : []
  return (
    <Folha aberta={aberta} aoFechar={aoFechar} titulo="Meus pedidos">
      {pedidos.length ? (
        <ul className="meus-pedidos">
          {pedidos.map((p) => (
            <li key={p.codigo}>
              <a href={`#/pedido/${p.codigo}`}>
                <span>
                  <b>{TIPO[p.tipo]} · {brl(p.total)}</b>
                  <small>{quando(p.em)}</small>
                </span>
                <Icone nome="seta" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="estado estado-vazio">Os pedidos feitos neste aparelho aparecem aqui, com a senha e o andamento.</p>
      )}
    </Folha>
  )
}

// Barra do topo: marca da loja e os três caminhos do cliente.
export default function Topo({ atual }) {
  const [pedidos, setPedidos] = useState(false)
  const marcar = (id) => (atual === id ? 'page' : undefined)

  return (
    <header className="topo">
      <div className="topo-dentro">
        <a href="#/" className="topo-marca" aria-label="Pastelanches Vitória, início">
          <img src="/logo.webp" alt="" width="40" height="40" />
        </a>
        <nav aria-label="Principal">
          <a href="#/" aria-current={marcar('cardapio')}>Cardápio</a>
          <a href="#/encomenda" aria-current={marcar('encomenda')}>Encomendas</a>
          <button type="button" onClick={() => setPedidos(true)}>Meus pedidos</button>
        </nav>
      </div>
      <MeusPedidos aberta={pedidos} aoFechar={() => setPedidos(false)} />
    </header>
  )
}
