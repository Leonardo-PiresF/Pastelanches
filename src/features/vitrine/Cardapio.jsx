import { useEffect, useState } from 'react'
import Foto from '../../components/Foto.jsx'
import Icone from '../../components/Icone.jsx'
import { CATEGORIAS } from '../../lib/config.js'
import { brl } from '../../lib/formato.js'
import { precoInicial } from '../../lib/pedido.js'

const numero = (p) => String(p.numero).padStart(2, '0')
const preco = (p) => (p.tamanhos ? `a partir de ${brl(precoInicial(p))}` : brl(p.preco))

const normalizar = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const NOME_CATEGORIA = Object.fromEntries([...CATEGORIAS.cardapio, ...CATEGORIAS.festa].map((c) => [c.id, c.nome]))

// Tudo que o cliente pode digitar para achar o item: nome, ingredientes, categoria,
// sabores (maracujá acha o suco, calabresa acha a pizza) e tamanhos (lata acha o refri).
const textoDe = (p) => normalizar([
  p.nome ?? p.titulo,
  p.descricao ?? p.texto,
  NOME_CATEGORIA[p.categoria],
  ...(p.sabores?.opcoes ?? []),
  ...Object.values(p.sabores?.descricoes ?? {}),
  ...(p.tamanhos ?? []).map((t) => t.nome)
].filter(Boolean).join(' '))

export function buscar(itens, termo) {
  const t = normalizar(termo.trim())
  if (!t) return []
  const numeroBuscado = /^\d{1,2}$/.test(t) ? Number(t) : null
  return itens.filter((p) => (numeroBuscado !== null && p.numero === numeroBuscado) || textoDe(p).includes(t))
}

// Linha do cardápio no padrão de app: texto à esquerda, foto (quando tem) à direita, botão + sempre no mesmo lugar.
function ItemLinha({ produto: p, aoEscolher }) {
  return (
    <li>
      <button type="button" className="item-linha" onClick={(e) => aoEscolher(p, e.currentTarget.querySelector('.botao-mais'))}>
        <span className="item-linha-texto">
          <b>{p.numero && <span className="numero">{numero(p)}</span>}{p.nome}</b>
          {(p.descricao || p.unidade) && <small>{[p.descricao, p.unidade].filter(Boolean).join(' · ')}</small>}
          <span className="preco">{preco(p)}</span>
        </span>
        <span className={`item-linha-lado ${p.foto ? 'com-foto' : ''}`}>
          {p.foto && <Foto src={p.foto} alt="" />}
          <span className="botao-mais" aria-hidden="true"><Icone nome="mais" tamanho={18} /></span>
        </span>
      </button>
    </li>
  )
}

export function Linhas({ produtos, aoEscolher }) {
  return (
    <ul className="linhas">
      {produtos.map((p) => <ItemLinha key={p.id} produto={p} aoEscolher={aoEscolher} />)}
    </ul>
  )
}

export function MaisPedidos({ produtos, aoEscolher }) {
  if (!produtos.length) return null
  return (
    <section className="mais-pedidos" aria-labelledby="titulo-mais-pedidos">
      <h2 id="titulo-mais-pedidos" className="titulo-secao">Mais pedidos</h2>
      <ul className="mais-pedidos-trilho">
        {produtos.map((p) => (
          <li key={p.id}>
            <button type="button" className="cartao-produto" onClick={(e) => aoEscolher(p, e.currentTarget.querySelector('.botao-mais'))}>
              <span className="cartao-produto-foto">
                <Foto src={p.foto} alt={p.nome} />
                <span className="botao-mais" aria-hidden="true"><Icone nome="mais" tamanho={18} /></span>
              </span>
              <b>{p.nome}</b>
              <span className="preco">{p.tamanhos ? brl(precoInicial(p)) : brl(p.preco)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Abas({ categorias }) {
  const [ativa, setAtiva] = useState(categorias[0]?.id)

  useEffect(() => {
    const secoes = categorias.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean)
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id.slice(4))),
      { rootMargin: '-25% 0px -65% 0px' }
    )
    secoes.forEach((s) => observador.observe(s))
    return () => observador.disconnect()
  }, [categorias])

  useEffect(() => {
    const aba = document.getElementById(`aba-${ativa}`)
    aba?.parentElement.scrollTo({ left: aba.offsetLeft - 16, behavior: 'smooth' })
  }, [ativa])

  return (
    <nav className="abas" aria-label="Categorias do cardápio">
      {categorias.map((c) => (
        <a key={c.id} id={`aba-${c.id}`} href={`#cat-${c.id}`} aria-current={ativa === c.id ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {c.nome}
        </a>
      ))}
    </nav>
  )
}

// A busca e o fim do cardápio também mostram o que é de encomenda, que fica em outra página.
export function ParaFesta({ produtos }) {
  if (!produtos.length) return null
  return (
    <ul className="linhas-festa-busca">
      {produtos.map((p) => (
        <li key={p.id}>
          <a className="item-linha" href={`#/encomenda/${p.categoria}`}>
            <span className="item-linha-texto">
              <b>{p.nome}</b>
              <small>Encomenda · pacote com 25</small>
              <span className="preco">{brl(p.preco)}</span>
            </span>
            <span className="item-linha-lado"><span className="botao-mais" aria-hidden="true"><Icone nome="seta" tamanho={18} /></span></span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function AtalhosFesta({ categorias }) {
  return (
    <section className="categoria atalhos-festa" aria-labelledby="titulo-festa">
      <header className="categoria-topo">
        <h2 id="titulo-festa" className="titulo-secao">Para festa</h2>
        <p className="dica">Pacotes de 25 por encomenda, com dia e horário de retirada.</p>
      </header>
      <nav aria-label="Categorias de encomenda">
        {categorias.map((c) => <a key={c.id} href={`#/encomenda/${c.id}`}>{c.nome}<Icone nome="seta" tamanho={16} /></a>)}
      </nav>
    </section>
  )
}

export function Listas({ produtos, aoEscolher }) {
  return CATEGORIAS.cardapio.map((cat) => {
    const lista = produtos.filter((p) => p.categoria === cat.id)
    if (!lista.length) return null
    return (
      <section key={cat.id} id={`cat-${cat.id}`} className="categoria" aria-labelledby={`titulo-${cat.id}`}>
        <header className="categoria-topo">
          <h2 id={`titulo-${cat.id}`} className="titulo-secao">{cat.nome}</h2>
          {cat.dica && <p className="dica">{cat.dica}</p>}
        </header>
        <Linhas produtos={lista} aoEscolher={aoEscolher} />
      </section>
    )
  })
}
