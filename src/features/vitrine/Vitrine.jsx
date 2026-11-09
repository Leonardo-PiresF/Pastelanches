import { useMemo, useState } from 'react'
import Destaques from './Destaques.jsx'
import { Abas, Linhas, Listas, MaisPedidos, buscar } from './Cardapio.jsx'
import ItemFolha from './ItemFolha.jsx'
import Checkout from './Checkout.jsx'
import Sacola from './Sacola.jsx'
import { itemDePromocao, itemDeProduto } from './item.js'
import { voar } from './voo.js'
import { useCatalogo } from '../../hooks/useCatalogo.js'
import { useCarrinho } from '../../hooks/useCarrinho.js'
import { Carregando, Erro } from '../../components/Estado.jsx'
import Icone from '../../components/Icone.jsx'
import Topo from '../../components/Topo.jsx'
import { BANNER_PADRAO } from '../../data/cardapio.js'
import { CATEGORIAS, LOJA } from '../../lib/config.js'
import { brl } from '../../lib/formato.js'
import { pedidoEmAndamento } from '../../lib/meusPedidos.js'
import { promocoesDeHoje, promocoesFuturas } from '../../lib/pedido.js'
import '../../styles/vitrine.css'

const MODOS = [['delivery', 'Delivery', 'moto'], ['retirada', 'Retirar', 'loja'], ['mesa', 'Na mesa', 'mesa']]
const mesaQr = new URLSearchParams(window.location.search).get('mesa')
const enderecoCurto = LOJA.endereco.split(',').slice(0, 2).join(',')

function detalheDoModo(modo, bairros) {
  if (modo === 'delivery') {
    const menor = Math.min(...bairros.map((b) => b.taxa))
    return bairros.length ? `Entrega a partir de ${brl(menor)} · pague na entrega` : 'Entrega indisponível no momento'
  }
  if (modo === 'mesa') return mesaQr ? `Mesa ${mesaQr} · pague no caixa e retire no balcão` : 'Pague no caixa e retire no balcão com a senha'
  return `Retire no balcão · ${enderecoCurto}`
}

export default function Vitrine() {
  const { dados, erro, carregando, recarregar } = useCatalogo()
  const carrinho = useCarrinho('cardapio')
  const [modo, setModo] = useState(mesaQr ? 'mesa' : 'delivery')
  const [alvo, setAlvo] = useState(null)
  const [checkout, setCheckout] = useState(false)
  const [termo, setTermo] = useState('')
  const acompanhar = useMemo(pedidoEmAndamento, [])

  const vitrine = useMemo(() => {
    if (!dados) return null
    const produtos = dados.produtos.filter((p) => p.catalogo === 'cardapio' && p.disponivel)
    return {
      produtos,
      destaques: produtos.filter((p) => p.destaque && p.foto),
      promocoes: promocoesDeHoje(dados.promocoes),
      futuras: promocoesFuturas(dados.promocoes),
      categorias: CATEGORIAS.cardapio.filter((c) => produtos.some((p) => p.categoria === c.id))
    }
  }, [dados])

  function escolherProduto(produto, origem) {
    if (produto.tamanhos || produto.sabores) return setAlvo({ produto })
    carrinho.adicionar(itemDeProduto(produto, { preco: produto.preco }))
    voar(origem.getBoundingClientRect(), produto.foto)
  }

  function escolherPromocao(promocao, origem) {
    if (promocao.sabores) return setAlvo({ promocao })
    carrinho.adicionar(itemDePromocao(promocao, {}))
    voar(origem.getBoundingClientRect(), promocao.foto)
  }

  function adicionarDaFolha(item, origem) {
    setAlvo(null)
    carrinho.adicionar(item)
    voar(origem, item.foto)
  }

  if (carregando) return <Carregando texto="Abrindo o cardápio…" />
  if (!dados) return <Erro texto={erro} aoTentar={recarregar} />

  const cozinhaAberta = dados.loja.cozinha_aberta
  const resultados = buscar(vitrine.produtos, termo)
  const buscando = termo.trim().length > 0
  const banner = dados.loja.banner ?? BANNER_PADRAO

  return (
    <div className="vitrine">
      <Topo atual="cardapio" />

      <header className="loja">
        <div className="loja-capa">
          <img src="/fotos/capa-pastel.webp" alt="" fetchPriority="high" />
        </div>
        <div className="loja-cartao">
          <img className="loja-logo" src="/logo.webp" alt="" width="96" height="96" />
          <div className="loja-nome">
            <h1>{LOJA.nome}</h1>
            <p className="loja-meta">
              <span className={`status ${cozinhaAberta ? 'aberto' : 'pausado'}`}>
                {cozinhaAberta ? `Aberto até ${LOJA.fechaAs}` : 'Pedidos pausados agora'}
              </span>
              <span><Icone nome="local" tamanho={16} />{enderecoCurto}</span>
            </p>
          </div>

          <div className="loja-pedir">
            {mesaQr ? null : (
              <div className="seletor-modo" role="group" aria-label="Como você quer pedir">
                {MODOS.map(([id, nome, icone]) => (
                  <button key={id} type="button" aria-pressed={modo === id} onClick={() => setModo(id)}>
                    <Icone nome={icone} tamanho={18} />{nome}
                  </button>
                ))}
              </div>
            )}
            <p className="loja-modo">{detalheDoModo(modo, dados.bairros)}</p>
          </div>
        </div>
      </header>

      <div className="faixas">
        {acompanhar && (
          <a className="faixa-acompanhar" href={`#/pedido/${acompanhar}`}>
            <Icone nome="relogio" />
            <span>Acompanhar meu último pedido</span>
            <Icone nome="seta" />
          </a>
        )}
        {!cozinhaAberta && (
          <p className="faixa-fechado" role="status">
            A cozinha pausou os pedidos agora. Dá para olhar o cardápio e encomendar salgados para festa.
          </p>
        )}
      </div>

      <div className="vitrine-corpo">
        <label className="busca">
          <Icone nome="busca" />
          <input type="search" value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Buscar no cardápio ou pelo número" aria-label="Buscar no cardápio" />
        </label>
        <div className="vitrine-navegacao">
          {!buscando && <Abas categorias={vitrine.categorias} />}
        </div>

        <main className="vitrine-conteudo">
          {buscando ? (
            <section className="categoria" aria-live="polite">
              <h2 className="titulo-secao">{resultados.length ? `${resultados.length} resultado${resultados.length > 1 ? 's' : ''}` : 'Nada encontrado'}</h2>
              {resultados.length
                ? <Linhas produtos={resultados} aoEscolher={escolherProduto} />
                : <p className="dica">Tente outro nome, um ingrediente ou o número do pastel especial.</p>}
            </section>
          ) : (
            <>
              <Destaques promocoes={vitrine.promocoes} futuras={vitrine.futuras} encomenda={banner} aoEscolher={escolherPromocao} />
              <MaisPedidos produtos={vitrine.destaques} aoEscolher={escolherProduto} />

              <Listas produtos={vitrine.produtos} aoEscolher={escolherProduto} />
            </>
          )}
        </main>

        <Sacola carrinho={carrinho} modo={modo} cozinhaAberta={cozinhaAberta} aoFechar={() => setCheckout(true)} />
      </div>

      <footer className="vitrine-rodape">
        <img src="/logo.webp" alt="" width="48" height="48" loading="lazy" />
        <p>
          <b>{LOJA.nome}</b><br />
          {LOJA.endereco}<br />
          {LOJA.telefone} · WhatsApp {LOJA.whatsappExibicao}
        </p>
      </footer>

      {carrinho.quantidade > 0 && (
        <button type="button" className="barra-carrinho" onClick={() => setCheckout(true)}>
          <span className="barra-carrinho-icone" data-destino-voo>
            <Icone nome="sacola" tamanho={22} />
            <span className="contador-carrinho">{carrinho.quantidade}</span>
          </span>
          <span className="barra-carrinho-acao">Ver sacola</span>
          <span className="barra-carrinho-total">{brl(carrinho.total)}</span>
        </button>
      )}

      <ItemFolha alvo={alvo} aoFechar={() => setAlvo(null)} aoAdicionar={adicionarDaFolha} />
      <Checkout
        aberto={checkout}
        aoFechar={() => setCheckout(false)}
        carrinho={carrinho}
        modo={modo}
        mesaQr={mesaQr}
        bairros={dados.bairros}
        cozinhaAberta={cozinhaAberta}
      />
    </div>
  )
}
