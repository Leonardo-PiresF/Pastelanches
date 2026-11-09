import { useState } from 'react'
import Folha from '../../components/Folha.jsx'
import Stepper from '../../components/Stepper.jsx'
import { LOJA, PAGAMENTOS } from '../../lib/config.js'
import { brl, mascaraTelefone, nomeItem, notaPedido, somenteDigitos } from '../../lib/formato.js'
import { criarPedido } from '../../lib/db.js'
import { abrirWhatsApp } from '../../lib/whatsapp.js'
import { irPara } from '../../hooks/useRota.js'
import { guardarPedido } from '../../lib/meusPedidos.js'
import { paraEnvio } from './item.js'

const CHAVE_CLIENTE = 'pastelanches:cliente'

function lerCliente() {
  try {
    return JSON.parse(window.localStorage.getItem(CHAVE_CLIENTE)) ?? {}
  } catch {
    return {}
  }
}

export default function Checkout({ aberto, aoFechar, carrinho, modo, mesaQr, bairros, cozinhaAberta }) {
  const salvo = lerCliente()
  const [f, setF] = useState({
    nome: salvo.nome ?? '',
    telefone: salvo.telefone ?? '',
    mesa: mesaQr ?? '',
    bairro: salvo.bairro ?? '',
    endereco: salvo.endereco ?? '',
    pagamento: 'Pix',
    troco: '',
    observacoes: ''
  })
  const [erro, setErro] = useState('')
  const [semConexao, setSemConexao] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  const taxa = modo === 'delivery' ? bairros.find((b) => b.nome === f.bairro)?.taxa ?? 0 : 0
  const total = carrinho.total + taxa

  function validar() {
    if (!f.nome.trim()) return 'Diga seu nome para chamarmos a senha.'
    if (modo === 'mesa' && !f.mesa) return 'Qual o número da mesa?'
    if (modo !== 'mesa' && somenteDigitos(f.telefone).length < 10) return 'Informe seu WhatsApp com DDD.'
    if (modo === 'delivery' && !f.bairro) return 'Escolha o bairro.'
    if (modo === 'delivery' && f.endereco.trim().length < 6) return 'Informe rua, número e um ponto de referência.'
    return ''
  }

  const montar = () => ({
    tipo: modo,
    mesa: modo === 'mesa' ? Number(f.mesa) : null,
    cliente: { nome: f.nome.trim(), telefone: modo === 'mesa' ? null : f.telefone },
    entrega: modo === 'delivery'
      ? { bairro: f.bairro, endereco: f.endereco.trim(), pagamento: f.pagamento, troco: f.pagamento === 'Dinheiro' ? f.troco.trim() : null }
      : null,
    itens: carrinho.itens.map(paraEnvio),
    observacoes: f.observacoes.trim() || null
  })

  async function enviar(e) {
    e.preventDefault()
    const problema = validar()
    if (problema) return setErro(problema)
    setErro('')
    setSemConexao(false)
    setEnviando(true)
    try {
      window.localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ nome: f.nome, telefone: f.telefone, bairro: f.bairro, endereco: f.endereco }))
    } catch {
      // segue sem lembrar os dados
    }
    try {
      const { codigo } = await criarPedido(montar())
      guardarPedido({ codigo, tipo: modo, total })
      carrinho.esvaziar()
      aoFechar()
      irPara(`/pedido/${codigo}`)
    } catch (e2) {
      setErro(e2.message.charAt(0).toUpperCase() + e2.message.slice(1))
      setSemConexao(/conexão/i.test(e2.message))
    } finally {
      setEnviando(false)
    }
  }

  function mandarPeloWhatsApp() {
    const p = { ...montar(), senha: '-', codigo: 'sem código', itens: carrinho.itens, totais: { taxa, total }, cliente: { nome: f.nome, telefone: f.telefone } }
    abrirWhatsApp(LOJA.whatsapp, notaPedido(p))
  }

  const rodape = (
    <div className="checkout-rodape">
      <p className="checkout-total"><span>Total</span><b>{brl(total)}</b></p>
      <button type="submit" form="form-checkout" className="botao botao-largo" disabled={enviando || !cozinhaAberta || !carrinho.itens.length}>
        {!cozinhaAberta ? 'Pedidos pausados agora' : enviando ? 'Enviando…' : 'Enviar pedido'}
      </button>
    </div>
  )

  return (
    <Folha aberta={aberto} aoFechar={aoFechar} titulo="Revisar pedido" rodape={rodape}>
      <h3 className="checkout-secao">Itens</h3>
      <ul className="checkout-itens">
        {carrinho.itens.map((it) => (
          <li key={it.chave}>
            <span className="checkout-item-texto">
              <b>{nomeItem(it)}</b>
              {it.obs && <small>{it.obs}</small>}
              <small>{brl(it.preco * it.qtd)}</small>
            </span>
            <Stepper valor={it.qtd} aoMudar={(q) => carrinho.mudarQuantidade(it.chave, q)} rotulo={it.nome} />
          </li>
        ))}
      </ul>

      <form id="form-checkout" className="formulario" onSubmit={enviar} noValidate>
        <h3 className="checkout-secao">{modo === 'delivery' ? 'Entrega' : 'Seus dados'}</h3>
        <label>Seu nome<input value={f.nome} onChange={mudar('nome')} autoComplete="given-name" maxLength={60} /></label>
        {modo === 'mesa' && !mesaQr && (
          <label>Número da mesa<input inputMode="numeric" value={f.mesa} onChange={(e) => setF({ ...f, mesa: somenteDigitos(e.target.value).slice(0, 3) })} /></label>
        )}
        {modo !== 'mesa' && (
          <label>WhatsApp<input type="tel" inputMode="tel" autoComplete="tel-national" value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} placeholder="(75) 9 0000-0000" /></label>
        )}
        {modo === 'delivery' && (
          <>
            <label>
              Bairro
              <select value={f.bairro} onChange={mudar('bairro')}>
                <option value="">Escolha</option>
                {bairros.map((b) => <option key={b.nome} value={b.nome}>{b.nome} · entrega {brl(b.taxa)}</option>)}
              </select>
            </label>
            <label>Endereço<input value={f.endereco} onChange={mudar('endereco')} autoComplete="street-address" placeholder="Rua, número e referência" maxLength={160} /></label>
            <fieldset>
              <legend>Pagamento na entrega</legend>
              <div className="opcoes">
                {PAGAMENTOS.map((p) => (
                  <button key={p} type="button" aria-pressed={f.pagamento === p} onClick={() => setF({ ...f, pagamento: p })}>{p}</button>
                ))}
              </div>
            </fieldset>
            {f.pagamento === 'Dinheiro' && (
              <label>Troco para quanto?<input inputMode="decimal" value={f.troco} onChange={mudar('troco')} placeholder="Ex.: 50" maxLength={10} /></label>
            )}
          </>
        )}
        <label>Observação do pedido<textarea rows="2" maxLength={300} value={f.observacoes} onChange={mudar('observacoes')} /></label>

        {modo === 'delivery' && taxa > 0 && <p className="dica">Inclui {brl(taxa)} de entrega.</p>}
        {modo !== 'delivery' && <p className="dica">Você paga no caixa mostrando a senha e retira no balcão.</p>}
        {erro && <p className="erro-campo" role="alert">{erro}</p>}
        {semConexao && (
          <button type="button" className="botao botao-secundario" onClick={mandarPeloWhatsApp}>Mandar pelo WhatsApp da loja</button>
        )}
      </form>
    </Folha>
  )
}
