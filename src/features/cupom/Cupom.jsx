import { useEffect, useState } from 'react'
import { LOJA } from '../../lib/config.js'
import { buscarPedido } from '../../lib/db.js'
import { brl, nomeItem, quando, tituloPedido } from '../../lib/formato.js'
import '../../styles/cupom.css'

// Cupom de 80mm. Dentro do painel, roda num iframe escondido e imprime sozinho.
// Aberto direto no navegador, mostra o botão.
const embutido = window.self !== window.top

export default function Cupom({ codigo }) {
  const [pedido, setPedido] = useState(undefined)
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarPedido(codigo).then(setPedido).catch((e) => setErro(e.message))
  }, [codigo])

  useEffect(() => {
    if (pedido && embutido) {
      const t = setTimeout(() => window.print(), 150)
      return () => clearTimeout(t)
    }
  }, [pedido])

  if (erro) return <p className="cupom-aviso">{erro}</p>
  if (pedido === undefined) return <p className="cupom-aviso">Carregando…</p>
  if (!pedido) return <p className="cupom-aviso">Pedido {codigo} não encontrado. Entre no painel e tente de novo.</p>

  const p = pedido
  return (
    <>
      {!embutido && (
        <div className="cupom-acoes">
          <button type="button" onClick={() => window.print()}>Imprimir</button>
          <a href="#/painel">Voltar ao painel</a>
        </div>
      )}
      <article className="cupom">
        <header>
          <b>{LOJA.nome}</b>
          <span>{LOJA.telefone}</span>
        </header>
        <p className="cupom-senha">SENHA {p.senha}</p>
        <p className="cupom-tipo">{tituloPedido(p).toUpperCase()}</p>
        <p>{p.codigo} · {quando(p.criado_em)}</p>
        <hr />
        <p><b>{p.cliente.nome}</b>{p.cliente.telefone && <><br />{p.cliente.telefone}</>}</p>
        {p.entrega && (
          <p>
            {p.entrega.endereco}<br />
            {p.entrega.bairro}<br />
            <b>{p.entrega.pagamento}{p.entrega.troco && ` · troco p/ ${p.entrega.troco}`}</b>
          </p>
        )}
        {p.retirada_em && <p><b>RETIRADA {quando(p.retirada_em).toUpperCase()}</b></p>}
        <hr />
        <ul>
          {p.itens.map((it, i) => (
            <li key={i}>
              <span><b>{it.qtd}x</b> {nomeItem(it)}</span>
              <span>{brl(it.preco * it.qtd)}</span>
              {it.obs && <em>» {it.obs}</em>}
            </li>
          ))}
        </ul>
        <hr />
        {p.totais.taxa > 0 && <p className="cupom-linha"><span>Entrega</span><span>{brl(p.totais.taxa)}</span></p>}
        <p className="cupom-linha cupom-total"><span>TOTAL</span><span>{brl(p.totais.total)}</span></p>
        {p.observacoes && <><hr /><p><b>OBS:</b> {p.observacoes}</p></>}
      </article>
    </>
  )
}
