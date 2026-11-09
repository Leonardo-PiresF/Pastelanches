import Stepper from '../../components/Stepper.jsx'
import { brl, nomeItem } from '../../lib/formato.js'

const AVISO = {
  mesa: 'Pague no caixa mostrando a senha e retire no balcão.',
  retirada: 'Pague no caixa mostrando a senha e retire no balcão.',
  delivery: 'A taxa de entrega entra quando você escolher o bairro.'
}

// Coluna fixa da sacola no computador. No celular, o mesmo papel é da barra do rodapé.
export default function Sacola({ carrinho, modo, cozinhaAberta, aoFechar }) {
  const vazia = !carrinho.itens.length

  return (
    <aside className="sacola" aria-labelledby="titulo-sacola">
      <h2 id="titulo-sacola" data-destino-voo>Sua sacola</h2>

      {vazia ? (
        <p className="sacola-vazia">Toque no + de um item do cardápio. Ele aparece aqui.</p>
      ) : (
        <ul className="sacola-itens">
          {carrinho.itens.map((it) => (
            <li key={it.chave}>
              <span className="sacola-item-nome">
                <b>{nomeItem(it)}</b>
                {it.obs && <small>{it.obs}</small>}
              </span>
              <span className="preco">{brl(it.preco * it.qtd)}</span>
              <Stepper valor={it.qtd} aoMudar={(q) => carrinho.mudarQuantidade(it.chave, q)} rotulo={it.nome} />
            </li>
          ))}
        </ul>
      )}

      <footer className="sacola-rodape">
        <p className="checkout-total"><span>Subtotal</span><b>{brl(carrinho.total)}</b></p>
        <p className="dica">{AVISO[modo]}</p>
        <button type="button" className="botao botao-largo" disabled={vazia || !cozinhaAberta} onClick={aoFechar}>
          {cozinhaAberta ? 'Revisar pedido' : 'Pedidos pausados agora'}
        </button>
      </footer>
    </aside>
  )
}
