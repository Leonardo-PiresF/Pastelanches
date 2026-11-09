import { useState } from 'react'
import BannerLoja from './BannerLoja.jsx'
import Folha from '../../components/Folha.jsx'
import Foto from '../../components/Foto.jsx'
import { Vazio } from '../../components/Estado.jsx'
import { BANNERS } from '../../lib/config.js'
import { brl } from '../../lib/formato.js'
import { removerPromocao, salvarPromocao } from '../../lib/db.js'
import { valeHoje } from '../../lib/pedido.js'
import { SEMANA } from '../../lib/tempo.js'

const VAZIA = { titulo: '', texto: '', preco: '', foto: '', rotulo: 'Sabor', opcoes: '', dias: [], data: '', ativa: true }

const paraFormulario = (p) => ({
  ...p,
  preco: String(p.preco).replace('.', ','),
  foto: p.foto ?? '',
  rotulo: p.sabores?.rotulo ?? 'Sabor',
  opcoes: p.sabores?.opcoes.join(', ') ?? '',
  dias: p.dias ?? [],
  data: p.data ?? ''
})

function quandoVale(p) {
  if (p.data) return `Só em ${p.data.split('-').reverse().slice(0, 2).join('/')}`
  if (!p.dias?.length || p.dias.length === 7) return 'Todo dia'
  return p.dias.map((d) => SEMANA[d].slice(0, 3)).join(', ')
}

function Formulario({ inicial, aoFechar }) {
  const [f, setF] = useState(inicial)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const alternarDia = (d) => setF({ ...f, dias: f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d].sort() })

  async function salvar(e) {
    e.preventDefault()
    const preco = Number(String(f.preco).replace(',', '.'))
    if (!f.titulo.trim()) return setErro('Dê um nome para a promoção.')
    if (!(preco > 0)) return setErro('Informe o preço da promoção.')
    const opcoes = f.opcoes.split(',').map((s) => s.trim()).filter(Boolean)
    setSalvando(true)
    try {
      await salvarPromocao({
        id: f.id ?? `${f.titulo.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase()}-${Date.now().toString(36)}`,
        titulo: f.titulo.trim(),
        texto: f.texto.trim() || null,
        preco,
        foto: f.foto || null,
        sabores: opcoes.length ? { rotulo: f.rotulo.trim() || 'Sabor', opcoes } : null,
        dias: f.data ? [] : f.dias,
        data: f.data || null,
        ativa: f.ativa,
        ordem: f.ordem ?? Date.now() % 100000
      })
      aoFechar()
    } catch (e2) {
      setErro(e2.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={salvar} id="form-promocao">
      <label>Nome<input value={f.titulo} onChange={mudar('titulo')} placeholder="Quarta do Canudão" maxLength={60} required /></label>
      <label>Descrição curta<input value={f.texto} onChange={mudar('texto')} placeholder="Crocante por fora, cremoso por dentro." maxLength={120} /></label>
      <label>Preço<input value={f.preco} onChange={mudar('preco')} inputMode="decimal" placeholder="25,00" required /></label>
      <label>
        Foto
        <select value={f.foto} onChange={mudar('foto')}>
          <option value="">Sem foto (banner amarelo)</option>
          {Object.entries(BANNERS).map(([src, b]) => <option key={src} value={src}>{b.nome}</option>)}
        </select>
      </label>
      <fieldset>
        <legend>Cliente escolhe (opcional)</legend>
        <div className="duas-colunas">
          <label>Pergunta<input value={f.rotulo} onChange={mudar('rotulo')} placeholder="Sabor" /></label>
          <label>Opções, separadas por vírgula<input value={f.opcoes} onChange={mudar('opcoes')} placeholder="Carne, Frango, Queijo" /></label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Quando vale</legend>
        <div className="dias-semana" role="group" aria-label="Dias da semana">
          {SEMANA.map((nome, d) => (
            <button key={d} type="button" aria-pressed={f.dias.includes(d)} disabled={Boolean(f.data)} onClick={() => alternarDia(d)}>
              {nome.slice(0, 3)}
            </button>
          ))}
        </div>
        <p className="dica">Nenhum dia marcado vale todo dia.</p>
        <label>Ou só numa data<input type="date" value={f.data} onChange={mudar('data')} /></label>
      </fieldset>
      <label className="chave"><input type="checkbox" checked={f.ativa} onChange={mudar('ativa')} /><span>Promoção ligada</span></label>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
      <button type="submit" className="botao botao-largo" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar promoção'}</button>
    </form>
  )
}

export default function Promocoes({ promocoes, loja }) {
  const [editando, setEditando] = useState(null)
  const [erro, setErro] = useState('')

  const agir = (fn) => fn().catch((e) => setErro(e.message))

  return (
    <section aria-label="Promoções">
      <div className="barra-ferramentas">
        <p className="dica">Viram banner no topo do cardápio nos dias marcados. Promoção com data marcada (um festival, por exemplo) já aparece antes como aviso, com o dia, e só libera o pedido na data.</p>
        <button type="button" className="botao" onClick={() => setEditando(VAZIA)}>Nova promoção</button>
      </div>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
      {!promocoes.length && <Vazio texto="Nenhuma promoção cadastrada ainda." />}

      <ul className="lista-promocoes">
        {promocoes.map((p) => (
          <li key={p.id} className={p.ativa ? '' : 'desligada'}>
            <Foto src={p.foto} alt={p.titulo} className="miniatura" />
            <div>
              <b>{p.titulo}</b>
              <small>{brl(p.preco)} · {quandoVale(p)}</small>
              {valeHoje(p) && <span className="etiqueta-hoje">No ar hoje</span>}
            </div>
            <label className="chave">
              <input type="checkbox" checked={p.ativa} onChange={(e) => agir(() => salvarPromocao({ ...p, ativa: e.target.checked }))} />
              <span>{p.ativa ? 'Ligada' : 'Desligada'}</span>
            </label>
            <div className="linha-botoes">
              <button type="button" className="botao botao-secundario" onClick={() => setEditando(paraFormulario(p))}>Editar</button>
              <button
                type="button"
                className="botao-texto"
                onClick={() => window.confirm(`Apagar "${p.titulo}"?`) && agir(() => removerPromocao(p.id))}
              >
                Apagar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Folha aberta={Boolean(editando)} aoFechar={() => setEditando(null)} titulo={editando?.id ? 'Editar promoção' : 'Nova promoção'}>
        {editando && <Formulario inicial={editando} aoFechar={() => setEditando(null)} />}
      </Folha>

      <BannerLoja loja={loja} />
    </section>
  )
}
