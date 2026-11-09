import { useState } from 'react'
import Banner from '../vitrine/Banner.jsx'
import { BANNER_PADRAO } from '../../data/cardapio.js'
import { salvarLoja } from '../../lib/db.js'

const paraFormulario = (b) => ({ ...b, preco: b.preco.toFixed(2).replace('.', ',') })
const lerPreco = (texto) => Number(String(texto).replace(/\s|R\$/g, '').replace(',', '.'))

// Banner das encomendas que aparece no topo do cardápio. A prévia muda enquanto a loja digita.
export default function BannerLoja({ loja }) {
  const [f, setF] = useState(() => paraFormulario(loja.banner ?? BANNER_PADRAO))
  const [estado, setEstado] = useState('')
  const [erro, setErro] = useState('')
  const mudar = (campo) => (e) => {
    setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
    setEstado('')
  }
  const preco = lerPreco(f.preco)

  async function salvar(e) {
    e.preventDefault()
    if (!f.titulo.trim()) return setErro('Escreva o título do banner.')
    if (!(preco > 0)) return setErro('Informe o valor, por exemplo 27,50.')
    setErro('')
    setEstado('salvando')
    try {
      await salvarLoja({ banner: { ativo: f.ativo, titulo: f.titulo.trim(), texto: f.texto.trim(), preco } })
      setEstado('salvo')
    } catch (e2) {
      setErro(e2.message)
      setEstado('')
    }
  }

  return (
    <section className="painel-bloco banner-loja" aria-label="Banner das encomendas">
      <h2>Banner das encomendas</h2>
      <p className="dica">Aparece no carrossel do topo do cardápio e leva o cliente para a página de encomendas. Mude o valor aqui quando o preço dos mini salgados mudar.</p>
      <div className={`banner-previa ${f.ativo ? '' : 'desligado'}`} aria-hidden="true">
        <Banner foto="/fotos/banner-salgados.webp" rotulo="Encomendas para festa" titulo={f.titulo} texto={f.texto}
          antesDoPreco="a partir de" preco={preco > 0 ? preco : 0} acao="Encomendar" />
      </div>
      <form className="formulario" onSubmit={salvar}>
        <div className="duas-colunas">
          <label>Título<input value={f.titulo} onChange={mudar('titulo')} maxLength={32} /></label>
          <label>Valor "a partir de"<input value={f.preco} onChange={mudar('preco')} inputMode="decimal" placeholder="27,50" /></label>
        </div>
        <label>Texto de apoio<input value={f.texto} onChange={mudar('texto')} maxLength={90} /></label>
        <label className="chave"><input type="checkbox" checked={f.ativo} onChange={mudar('ativo')} /><span>Mostrar no cardápio</span></label>
        {erro && <p className="erro-campo" role="alert">{erro}</p>}
        <button type="submit" className="botao" disabled={estado === 'salvando'}>
          {estado === 'salvando' ? 'Salvando…' : estado === 'salvo' ? 'Salvo' : 'Salvar banner'}
        </button>
      </form>
    </section>
  )
}
