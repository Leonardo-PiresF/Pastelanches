import { useState } from 'react'
import CampoPreco from './CampoPreco.jsx'
import { CATEGORIAS, FOTOS } from '../../lib/config.js'
import { salvarProduto } from '../../lib/db.js'

const normalizar = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function LinhaProduto({ produto: p, aoErro }) {
  const salvar = (campos) => salvarProduto(p.id, campos).catch((e) => { aoErro(e.message); throw e })

  return (
    <li className={`linha-produto ${p.disponivel ? '' : 'em-falta'}`}>
      <div className="linha-produto-nome">
        <b>{p.numero && <span className="numero">{String(p.numero).padStart(2, '0')}</span>}{p.nome}</b>
        {p.unidade && <small>{p.unidade}</small>}
      </div>

      <div className="linha-produto-precos">
        {p.tamanhos
          ? p.tamanhos.map((t, i) => (
            <CampoPreco
              key={t.nome}
              rotulo={t.nome}
              valor={t.preco}
              aoSalvar={(preco) => salvar({ tamanhos: p.tamanhos.map((x, j) => (j === i ? { ...x, preco } : x)) })}
            />
          ))
          : <CampoPreco rotulo="Preço" valor={p.preco} aoSalvar={(preco) => salvar({ preco })} />}
      </div>

      <div className="linha-produto-chaves">
        <label className="chave">
          <input type="checkbox" checked={p.disponivel} onChange={(e) => salvar({ disponivel: e.target.checked })} />
          <span>{p.disponivel ? 'Tem hoje' : 'Em falta'}</span>
        </label>
        {p.catalogo === 'cardapio' && (
          <>
            <select
              aria-label={`Foto de ${p.nome}`}
              value={p.foto ?? ''}
              onChange={(e) => salvar(e.target.value ? { foto: e.target.value } : { foto: null, destaque: false })}
            >
              <option value="">Sem foto</option>
              {FOTOS.map(([src, nome]) => <option key={src} value={src}>{nome}</option>)}
            </select>
            <label className="chave">
              <input type="checkbox" checked={p.destaque} disabled={!p.foto} onChange={(e) => salvar({ destaque: e.target.checked })} />
              <span>Destaque</span>
            </label>
          </>
        )}
      </div>
    </li>
  )
}

export default function Cardapio({ produtos }) {
  const [catalogo, setCatalogo] = useState('cardapio')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  const termo = normalizar(busca.trim())
  const visiveis = produtos.filter((p) =>
    p.catalogo === catalogo && (!termo || normalizar(p.nome).includes(termo) || String(p.numero) === termo))
  const emFalta = produtos.filter((p) => !p.disponivel).length

  return (
    <section className="cardapio-editor" aria-label="Cardápio e preços">
      <div className="barra-ferramentas">
        <div className="seletor" role="group" aria-label="Catálogo">
          <button type="button" aria-pressed={catalogo === 'cardapio'} onClick={() => setCatalogo('cardapio')}>Cardápio do dia</button>
          <button type="button" aria-pressed={catalogo === 'festa'} onClick={() => setCatalogo('festa')}>Salgados de festa</button>
        </div>
        <input type="search" placeholder="Buscar pelo nome ou número" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar produto" />
        {emFalta > 0 && <span className="aviso-falta">{emFalta} em falta</span>}
      </div>
      <p className="dica">O preço salva sozinho quando você sai do campo. "Em falta" esconde o item do cardápio na hora.</p>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}

      {CATEGORIAS[catalogo].map((cat) => {
        const lista = visiveis.filter((p) => p.categoria === cat.id)
        if (!lista.length) return null
        return (
          <section key={cat.id} className="grupo-produtos">
            <h2>{cat.nome}</h2>
            <ul>{lista.map((p) => <LinhaProduto key={p.id} produto={p} aoErro={setErro} />)}</ul>
          </section>
        )
      })}
      {!visiveis.length && <p className="estado estado-vazio">Nada encontrado com "{busca}".</p>}
    </section>
  )
}
