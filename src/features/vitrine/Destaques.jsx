import { useEffect, useRef, useState } from 'react'
import Banner from './Banner.jsx'
import Icone from '../../components/Icone.jsx'

// "Só hoje" só quando vale num dia; promoção de vários dias ganha "Hoje".
const etiqueta = (p) => {
  if (p.data || p.dias?.length === 1) return 'Só hoje'
  return p.dias?.length && p.dias.length < 7 ? 'Hoje' : 'Promoção'
}
const diaCurto = (data) => data.split('-').reverse().slice(0, 2).join('/')

// Carrossel do topo do cardápio: promoções de hoje, encomendas e o que vem por aí.
export default function Destaques({ promocoes, futuras, encomenda, aoEscolher }) {
  const trilho = useRef(null)
  const [atual, setAtual] = useState(0)

  const slides = [
    ...promocoes.map((p) => (
      <Banner key={p.id} foto={p.foto} rotulo={etiqueta(p)} titulo={p.titulo} texto={p.texto} preco={p.preco}
        acao="Pedir agora" aoTocar={(origem) => aoEscolher(p, origem)} />
    )),
    encomenda.ativo && (
      <Banner key="encomenda" foto="/fotos/banner-salgados.webp" rotulo="Encomendas para festa" titulo={encomenda.titulo}
        texto={encomenda.texto} antesDoPreco="a partir de" preco={encomenda.preco} acao="Encomendar" href="#/encomenda" />
    ),
    ...futuras.map((p) => (
      <Banner key={p.id} foto={p.foto} rotulo={`Dia ${diaCurto(p.data)}`} titulo={p.titulo} texto={p.texto} preco={p.preco} />
    ))
  ].filter(Boolean)
  const total = slides.length

  useEffect(() => {
    const itens = [...trilho.current?.children ?? []]
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtual(itens.indexOf(e.target))),
      { root: trilho.current, threshold: 0.6 }
    )
    itens.forEach((li) => observador.observe(li))
    return () => observador.disconnect()
  }, [total])

  if (!total) return null
  const ir = (i) => trilho.current.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })

  return (
    <section className="destaques" aria-label="Promoções e encomendas">
      <ul className="destaques-trilho" ref={trilho}>
        {slides.map((slide) => <li key={slide.key}>{slide}</li>)}
      </ul>
      {total > 1 && (
        <div className="destaques-controle">
          <button type="button" className="botao-flutuante" aria-label="Anterior" disabled={atual === 0} onClick={() => ir(atual - 1)}><Icone nome="voltar" /></button>
          <span className="destaques-pontos" aria-hidden="true">
            {slides.map((slide, i) => <i key={slide.key} className={i === atual ? 'atual' : ''} />)}
          </span>
          <button type="button" className="botao-flutuante" aria-label="Próximo" disabled={atual === total - 1} onClick={() => ir(atual + 1)}><Icone nome="seta" /></button>
        </div>
      )}
    </section>
  )
}
