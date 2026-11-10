import { useEffect, useState } from 'react'
import Entrar from './Entrar.jsx'
import Fila from './Fila.jsx'
import Encomendas from './Encomendas.jsx'
import Cardapio from './Cardapio.jsx'
import Promocoes from './Promocoes.jsx'
import Agenda from './Agenda.jsx'
import Loja from './Loja.jsx'
import { usePedidos } from './usePedidos.js'
import { useCatalogo } from '../../hooks/useCatalogo.js'
import { Carregando, Erro } from '../../components/Estado.jsx'
import { aoMudarSessao, modoDemo, sair, salvarLoja, sessaoAtual } from '../../lib/db.js'
import { arquivo } from '../../lib/config.js'
import '../../styles/painel.css'

const ABAS = [
  ['pedidos', 'Pedidos'],
  ['encomendas', 'Encomendas'],
  ['cardapio', 'Cardápio e preços'],
  ['promocoes', 'Promoções'],
  ['agenda', 'Agenda'],
  ['loja', 'Entrega e QR']
]

const CHAVE_AUTO = 'pastelanches:imprimir-ao-chegar'

function lerAuto() {
  try {
    return window.localStorage.getItem(CHAVE_AUTO) === '1'
  } catch {
    return false
  }
}

function Area({ aba, sessao }) {
  const catalogo = useCatalogo()
  const [imprimirAoChegar, setImprimirAoChegar] = useState(lerAuto)
  const { pedidos, erro, recarregar, aoAtualizar } = usePedidos({ imprimirAoChegar })
  const [erroLoja, setErroLoja] = useState('')

  const pendentes = pedidos?.filter((p) => p.status === 'novo').length ?? 0
  useEffect(() => {
    document.title = pendentes ? `(${pendentes}) Painel · Pastelanches` : 'Painel · Pastelanches'
  }, [pendentes])

  function alternarAuto(ligar) {
    setImprimirAoChegar(ligar)
    try {
      window.localStorage.setItem(CHAVE_AUTO, ligar ? '1' : '0')
    } catch {
      // sem armazenamento: vale só enquanto a aba estiver aberta
    }
  }

  const cozinhaAberta = catalogo.dados?.loja.cozinha_aberta
  const alternarCozinha = () =>
    salvarLoja({ cozinha_aberta: !cozinhaAberta }).then(() => setErroLoja('')).catch((e) => setErroLoja(e.message))

  const novasEncomendas = pedidos?.filter((p) => p.tipo === 'encomenda' && p.status === 'novo').length ?? 0
  const pedidosNovos = pendentes - novasEncomendas

  let conteudo
  if (aba === 'pedidos' || aba === 'encomendas') {
    if (erro && !pedidos) conteudo = <Erro texto={erro} aoTentar={recarregar} />
    else if (!pedidos) conteudo = <Carregando texto="Buscando pedidos…" />
    else conteudo = aba === 'pedidos'
      ? <Fila pedidos={pedidos} aoAtualizar={aoAtualizar} />
      : <Encomendas pedidos={pedidos} aoAtualizar={aoAtualizar} />
  } else if (catalogo.erro && !catalogo.dados) {
    conteudo = <Erro texto={catalogo.erro} aoTentar={catalogo.recarregar} />
  } else if (catalogo.carregando) {
    conteudo = <Carregando />
  } else {
    const { produtos, promocoes, loja, especiais, bairros } = catalogo.dados
    conteudo = {
      cardapio: <Cardapio produtos={produtos} />,
      promocoes: <Promocoes promocoes={promocoes} loja={loja} />,
      agenda: <Agenda loja={loja} especiais={especiais} />,
      loja: <Loja bairros={bairros} />
    }[aba]
  }

  return (
    <div className="painel">
      <header className="painel-topo">
        <img src={arquivo('/logo.webp')} alt="" width="40" height="40" />
        <h1>Painel</h1>
        {catalogo.dados && (
          <button
            type="button"
            className={`interruptor ${cozinhaAberta ? 'ligado' : ''}`}
            aria-pressed={cozinhaAberta}
            onClick={alternarCozinha}
          >
            {cozinhaAberta ? 'Recebendo pedidos' : 'Pedidos pausados'}
          </button>
        )}
        <label className="chave">
          <input type="checkbox" checked={imprimirAoChegar} onChange={(e) => alternarAuto(e.target.checked)} />
          <span>Imprimir ao chegar</span>
        </label>
        <button type="button" className="botao-texto" onClick={() => sair().then(() => sessao.aoSair())}>Sair</button>
      </header>
      {erroLoja && <p className="erro-campo" role="alert">{erroLoja}</p>}
      {erro && pedidos && <p className="aviso-conexao" role="status">Sem conexão. Tentando de novo…</p>}

      <nav className="painel-abas" aria-label="Seções do painel">
        {ABAS.map(([id, nome]) => (
          <a key={id} href={`#/painel/${id}`} aria-current={aba === id ? 'page' : undefined}>
            {nome}
            {id === 'pedidos' && pedidosNovos > 0 && <span className="contador">{pedidosNovos}</span>}
            {id === 'encomendas' && novasEncomendas > 0 && <span className="contador">{novasEncomendas}</span>}
          </a>
        ))}
      </nav>

      <main className="painel-conteudo">{conteudo}</main>
      {modoDemo && <p className="rodape-demo">Modo demonstração. Configure o Supabase para usar de verdade.</p>}
    </div>
  )
}

export default function Painel({ aba = 'pedidos' }) {
  const [sessao, setSessao] = useState(undefined)

  useEffect(() => {
    sessaoAtual().then(setSessao)
    return aoMudarSessao(setSessao)
  }, [])

  if (sessao === undefined) return <Carregando />
  if (!sessao) return <Entrar aoEntrar={setSessao} />
  const valida = ABAS.some(([id]) => id === aba) ? aba : 'pedidos'
  return <Area aba={valida} sessao={{ aoSair: () => setSessao(null) }} />
}
