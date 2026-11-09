import { useState } from 'react'
import { ETAPAS, LOJA, MOTIVOS_RECUSA } from '../../lib/config.js'
import { brl, mensagemCliente, mensagemMotoboy, nomeItem, notaPedido, quando, tituloPedido } from '../../lib/formato.js'
import { horaDe } from '../../lib/tempo.js'
import { abrirWhatsApp, compartilharWhatsApp } from '../../lib/whatsapp.js'
import { imprimirPedido } from '../../lib/impressao.js'

const PROXIMO = {
  mesa: { novo: ['preparo', 'Mandar pro fogo'], preparo: ['pronto', 'Está pronto'], pronto: ['finalizado', 'Retirado'] },
  retirada: { novo: ['preparo', 'Mandar pro fogo'], preparo: ['pronto', 'Está pronto'], pronto: ['finalizado', 'Retirado'] },
  delivery: { novo: ['preparo', 'Mandar pro fogo'], preparo: ['pronto', 'Saiu para entrega'], pronto: ['finalizado', 'Entregue'] },
  encomenda: { novo: ['aceito', 'Confirmar'], aceito: ['preparo', 'Em produção'], preparo: ['pronto', 'Está pronta'], pronto: ['finalizado', 'Retirada'] }
}

const rotuloStatus = (p) =>
  p.status === 'recusado' ? 'Recusado' : ETAPAS[p.tipo].find(([s]) => s === p.status)?.[1] ?? p.status

export default function CartaoPedido({ pedido: p, aoAtualizar }) {
  const [recusando, setRecusando] = useState(false)
  const [motivo, setMotivo] = useState(MOTIVOS_RECUSA[0])
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const proximo = PROXIMO[p.tipo][p.status]
  const encerrado = p.status === 'finalizado' || p.status === 'recusado'

  async function mudar(campos) {
    setOcupado(true)
    setErro('')
    try {
      await aoAtualizar(p.id, campos)
      setRecusando(false)
    } catch (e) {
      setErro(e.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <article className={`cartao-pedido status-${p.status}`} aria-label={`Senha ${p.senha}`}>
      <header>
        <span className="senha-mini">{p.senha}</span>
        <div className="cartao-pedido-titulo">
          <b>{tituloPedido(p)} · {p.cliente.nome}</b>
          <small>
            {p.retirada_em ? `Retirada ${quando(p.retirada_em)}` : `Pedido às ${horaDe(p.criado_em)}`} · {p.codigo}
          </small>
        </div>
        <span className="etiqueta-status">{rotuloStatus(p)}</span>
      </header>

      <ul className="cartao-pedido-itens">
        {p.itens.map((it, i) => (
          <li key={i}>
            <b>{it.qtd}x</b> {nomeItem(it)}
            {it.obs && <em>obs: {it.obs}</em>}
          </li>
        ))}
      </ul>

      {p.entrega && (
        <p className="cartao-pedido-entrega">
          {p.entrega.endereco}, {p.entrega.bairro}<br />
          {p.entrega.pagamento}{p.entrega.troco && `, troco para ${p.entrega.troco}`} · {p.cliente.telefone}
        </p>
      )}
      {p.observacoes && <p className="cartao-pedido-obs">Obs.: {p.observacoes}</p>}
      {p.motivo_recusa && <p className="cartao-pedido-obs">Recusado: {p.motivo_recusa}</p>}

      <p className="cartao-pedido-total">
        <span>Total</span>
        <b>{brl(p.totais.total)}</b>
      </p>

      {recusando ? (
        <div className="cartao-pedido-recusa">
          <label>
            Motivo
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
              {MOTIVOS_RECUSA.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <div className="linha-botoes">
            <button type="button" className="botao botao-secundario" onClick={() => setRecusando(false)}>Voltar</button>
            <button type="button" className="botao" disabled={ocupado} onClick={() => mudar({ status: 'recusado', motivo_recusa: motivo })}>
              Recusar pedido
            </button>
          </div>
        </div>
      ) : (
        <div className="linha-botoes">
          {proximo && (
            <button type="button" className="botao" disabled={ocupado} onClick={() => mudar({ status: proximo[0] })}>
              {proximo[1]}
            </button>
          )}
          <button type="button" className="botao botao-secundario" onClick={() => imprimirPedido(p.codigo)}>Imprimir</button>
          <button type="button" className="botao botao-secundario" onClick={() => abrirWhatsApp(LOJA.whatsapp, notaPedido(p))}>
            WhatsApp da loja
          </button>
          {p.tipo === 'delivery' && !encerrado && (
            <button type="button" className="botao botao-secundario" onClick={() => compartilharWhatsApp(mensagemMotoboy(p))}>Motoboy</button>
          )}
          {p.cliente.telefone && (p.status === 'aceito' || p.status === 'recusado' || (p.tipo === 'delivery' && p.status === 'pronto')) && (
            <button type="button" className="botao botao-secundario" onClick={() => abrirWhatsApp(p.cliente.telefone, mensagemCliente(p))}>
              Avisar cliente
            </button>
          )}
          {(p.status === 'novo' || p.status === 'aceito') && (
            <button type="button" className="botao-texto" onClick={() => setRecusando(true)}>Recusar</button>
          )}
        </div>
      )}
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
    </article>
  )
}
