import { useState } from 'react'
import QrCode from './QrCode.jsx'
import { LOJA } from '../../lib/config.js'
import { brl } from '../../lib/formato.js'
import { removerBairro, salvarBairro } from '../../lib/db.js'

function imprimirFolha(id) {
  document.body.dataset.imprimir = id
  window.addEventListener('afterprint', () => delete document.body.dataset.imprimir, { once: true })
  window.print()
}

function Bairros({ bairros }) {
  const [novo, setNovo] = useState({ nome: '', taxa: '' })
  const [erro, setErro] = useState('')
  const agir = (fn) => fn().then(() => setErro('')).catch((e) => setErro(e.message))

  function adicionar(e) {
    e.preventDefault()
    const taxa = Number(String(novo.taxa).replace(',', '.'))
    if (!novo.nome.trim() || !(taxa >= 0) || novo.taxa === '') return setErro('Informe o bairro e a taxa.')
    agir(() => salvarBairro({ nome: novo.nome.trim(), taxa })).then(() => setNovo({ nome: '', taxa: '' }))
  }

  return (
    <section className="painel-bloco" aria-label="Bairros de entrega">
      <h2>Bairros e taxa de entrega</h2>
      <p className="dica">Só os bairros desta lista aparecem no delivery. Para mudar a taxa, cadastre o mesmo bairro com o valor novo.</p>
      <form className="nova-data" onSubmit={adicionar}>
        <label>Bairro<input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} maxLength={40} /></label>
        <label>Taxa<input value={novo.taxa} onChange={(e) => setNovo({ ...novo, taxa: e.target.value })} inputMode="decimal" placeholder="5,00" /></label>
        <button type="submit" className="botao">Salvar bairro</button>
      </form>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
      <ul className="lista-simples">
        {bairros.map((b) => (
          <li key={b.nome}>
            <span><b>{b.nome}</b> {brl(b.taxa)}</span>
            <button type="button" className="botao-texto" onClick={() => agir(() => removerBairro(b.nome))}>Remover</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Mesas() {
  const [quantas, setQuantas] = useState(12)
  const base = `${window.location.origin}${window.location.pathname}`

  return (
    <section className="painel-bloco" aria-label="QR das mesas">
      <h2>QR Code das mesas</h2>
      <p className="dica">O cliente aponta a câmera, o cardápio abre com o número da mesa e ele busca o pedido no balcão pela senha.</p>
      <div className="linha-botoes">
        <label className="campo-curto">
          Quantas mesas
          <input type="number" min="1" max="60" value={quantas} onChange={(e) => setQuantas(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} />
        </label>
        <button type="button" className="botao" onClick={() => imprimirFolha('mesas')}>Imprimir os QR</button>
      </div>
      <div id="imprimir-mesas" className="grade-qr">
        {Array.from({ length: quantas }, (_, i) => (
          <figure key={i}>
            <QrCode texto={`${base}?mesa=${i + 1}`} rotulo={`QR da mesa ${i + 1}`} tamanho={140} />
            <figcaption><b>Mesa {i + 1}</b> Peça pelo celular e retire no balcão</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Avaliacao() {
  if (!LOJA.linkAvaliacao) {
    return (
      <section className="painel-bloco" aria-label="Avaliação no Google">
        <h2>Avaliação no Google</h2>
        <p className="dica">
          Falta o link. No Perfil da Empresa do Google, toque em "Pedir avaliações" e copie o link. Ele é gratuito e não tem mensalidade.
          Depois é só colocar em <code>src/lib/config.js</code>, no campo <code>linkAvaliacao</code>.
        </p>
      </section>
    )
  }
  return (
    <section className="painel-bloco" aria-label="Avaliação no Google">
      <h2>Avaliação no Google</h2>
      <p className="dica">Cole no balcão. O mesmo link aparece para o cliente quando o pedido fica pronto.</p>
      <div id="imprimir-avaliacao" className="cartaz-avaliacao">
        <QrCode texto={LOJA.linkAvaliacao} rotulo="QR para avaliar no Google" />
        <b>Gostou? Avalie a gente no Google</b>
        <span>Aponte a câmera do celular</span>
      </div>
      <button type="button" className="botao" onClick={() => imprimirFolha('avaliacao')}>Imprimir cartaz</button>
    </section>
  )
}

export default function Loja({ bairros }) {
  return (
    <div className="loja-painel">
      <Bairros bairros={bairros} />
      <Mesas />
      <Avaliacao />
    </div>
  )
}
