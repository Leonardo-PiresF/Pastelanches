import Icone from '../../components/Icone.jsx'
import { BANNERS, recorteDe } from '../../lib/config.js'
import { brl } from '../../lib/formato.js'
import '../../styles/banner.css'

// Banner de promoção. No celular a foto fica em cima e o texto embaixo; a partir do tablet
// o texto ocupa o lado vazio da foto larga. Com href vira link, com aoTocar vira botão,
// sem nenhum dos dois é só um aviso.
export default function Banner({ foto, rotulo, titulo, texto, antesDoPreco = 'por', preco, acao, href, aoTocar, prioridade = false }) {
  const feito = BANNERS[foto]
  const classes = ['banner', foto ? (feito ? '' : 'banner-recorte') : 'banner-sem-foto', !foto || feito?.claro ? 'banner-claro' : '']
  const Raiz = href ? 'a' : aoTocar ? 'button' : 'div'
  const alvo = href ? { href } : aoTocar ? { type: 'button', onClick: (e) => aoTocar(e.currentTarget) } : {}

  return (
    <Raiz className={classes.filter(Boolean).join(' ')} style={feito && { '--tom': feito.tom }} {...alvo}>
      {foto && (
        <picture className="banner-midia">
          {feito && <source media="(max-width: 719px)" srcSet={recorteDe(foto)} />}
          <img src={foto} alt="" loading={prioridade ? 'eager' : 'lazy'} />
        </picture>
      )}
      <span className="banner-corpo">
        {rotulo && <small className="banner-rotulo">{rotulo}</small>}
        <b className="banner-titulo">{titulo}</b>
        {texto && <span className="banner-texto">{texto}</span>}
        <span className="banner-rodape">
          <span className="banner-preco"><small>{antesDoPreco}</small><b>{brl(preco)}</b></span>
          {acao && <span className="banner-acao">{acao}<Icone nome="seta" tamanho={16} /></span>}
        </span>
      </span>
    </Raiz>
  )
}
