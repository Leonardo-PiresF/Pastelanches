import { useEffect, useMemo, useRef, useState } from 'react'
import Foto from '../../components/Foto.jsx'
import { brl } from '../../lib/formato.js'

const precoCurto = (v) => brl(v).replace(',00', '')

// "Só hoje" só quando vale num dia; promoção de vários dias ganha "Hoje".
const etiqueta = (p) => {
  if (p.data || p.dias?.length === 1) return 'Só hoje'
  return p.dias?.length && p.dias.length < 7 ? 'Hoje' : 'Promoção'
}

const fotoPrimeiro = (lista) => [...lista].sort((a, b) => Boolean(b.foto) - Boolean(a.foto))

export default function Promocoes({ promocoes: todas, aoEscolher }) {
  const promocoes = useMemo(() => fotoPrimeiro(todas), [todas])
  const trilho = useRef(null)
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    const cards = [...trilho.current.children]
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtual(cards.indexOf(e.target))),
      { root: trilho.current, threshold: 0.6 }
    )
    cards.forEach((c) => observador.observe(c))
    return () => observador.disconnect()
  }, [promocoes])

  return (
    <section className="promocoes" aria-labelledby="titulo-promocoes">
      <div className="secao-topo">
        <h2 id="titulo-promocoes" className="titulo-secao">Promoções de hoje</h2>
        {promocoes.length > 1 && <span className="contador-promo" aria-live="polite">{atual + 1}/{promocoes.length}</span>}
      </div>

      <ul className="promocoes-trilho" ref={trilho} aria-label="Promoções, role para o lado">
        {promocoes.map((p, i) => (
          <li key={p.id} className="promo">
            <button type="button" className="promo-toque" onClick={(e) => aoEscolher(p, e.currentTarget)}>
              <span className={`promo-midia ${p.foto ? '' : 'sem-foto'}`}>
                {p.foto ? (
                  <>
                    <Foto src={p.foto} alt="" prioridade={i === 0} />
                    <span className="selo-preco"><small>por</small><b>{precoCurto(p.preco)}</b></span>
                  </>
                ) : (
                  <span className="promo-preco-grande"><small>por</small>{precoCurto(p.preco)}</span>
                )}
                <span className="etiqueta-so-hoje">{etiqueta(p)}</span>
              </span>
              <span className="promo-corpo">
                <b>{p.titulo}</b>
                {p.texto && <small>{p.texto}</small>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
