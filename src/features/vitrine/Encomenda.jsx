import { useEffect, useMemo, useState } from 'react'
import Stepper from '../../components/Stepper.jsx'
import Topo from '../../components/Topo.jsx'
import { Carregando, Erro } from '../../components/Estado.jsx'
import { useCatalogo } from '../../hooks/useCatalogo.js'
import { useCarrinho } from '../../hooks/useCarrinho.js'
import { useFeriados } from '../../hooks/useFeriados.js'
import { irPara } from '../../hooks/useRota.js'
import { CATEGORIAS, arquivo } from '../../lib/config.js'
import { brl, mascaraTelefone, somenteDigitos } from '../../lib/formato.js'
import { montarDias } from '../../lib/agenda.js'
import { criarPedido, horariosOcupados } from '../../lib/db.js'
import { diaDe, rotuloDia, somarDias } from '../../lib/tempo.js'
import { Abas } from './Cardapio.jsx'
import { itemDeProduto, paraEnvio } from './item.js'
import { guardarPedido } from '../../lib/meusPedidos.js'
import '../../styles/vitrine.css'

const DIAS_A_FRENTE = 21

function useOcupados() {
  const [ocupados, setOcupados] = useState([])
  useEffect(() => {
    const hoje = diaDe()
    horariosOcupados(hoje, somarDias(hoje, DIAS_A_FRENTE)).then(setOcupados).catch(() => setOcupados([]))
  }, [])
  return ocupados
}

export default function Encomenda({ categoria }) {
  const { dados, erro, carregando, recarregar } = useCatalogo()
  const carrinho = useCarrinho('encomenda')
  const feriados = useFeriados()
  const ocupados = useOcupados()
  const [dia, setDia] = useState(null)
  const [horario, setHorario] = useState(null)
  const [f, setF] = useState({ nome: '', telefone: '', observacoes: '' })
  const [problema, setProblema] = useState('')
  const [enviando, setEnviando] = useState(false)

  const dias = useMemo(() => (dados
    ? montarDias({ agenda: dados.loja.agenda, especiais: dados.especiais, feriados, ocupados, quantos: DIAS_A_FRENTE })
    : []), [dados, feriados, ocupados])

  // Vindo da busca ou do atalho do cardápio (#/encomenda/quiches), já abre na categoria.
  useEffect(() => {
    if (dados && categoria) document.getElementById(`cat-${categoria}`)?.scrollIntoView()
  }, [dados, categoria])

  if (carregando) return <Carregando texto="Abrindo as encomendas…" />
  if (!dados) return <Erro texto={erro} aoTentar={recarregar} />

  const produtos = dados.produtos.filter((p) => p.catalogo === 'festa' && p.disponivel)
  const categorias = CATEGORIAS.festa.filter((c) => produtos.some((p) => p.categoria === c.id))
  const pacotes = (id) => carrinho.itens.find((it) => it.produto_id === id)?.qtd ?? 0
  const mudar = (produto, qtd) => {
    const atual = pacotes(produto.id)
    if (!atual && qtd > 0) carrinho.adicionar(itemDeProduto(produto, { preco: produto.preco, qtd }))
    else carrinho.mudarQuantidade(`${produto.id}|||`, qtd)
  }
  const diaEscolhido = dias.find((d) => d.dia === dia)
  const unidades = carrinho.quantidade * 25

  async function enviar() {
    if (!carrinho.quantidade) return setProblema('Escolha pelo menos um pacote.')
    if (!horario) return setProblema('Escolha o dia e o horário da retirada.')
    if (!f.nome.trim()) return setProblema('Diga seu nome.')
    if (somenteDigitos(f.telefone).length < 10) return setProblema('Informe seu WhatsApp com DDD para a loja confirmar.')
    setProblema('')
    setEnviando(true)
    try {
      const { codigo } = await criarPedido({
        tipo: 'encomenda',
        cliente: { nome: f.nome.trim(), telefone: f.telefone },
        itens: carrinho.itens.map(paraEnvio),
        retirada_em: horario.iso,
        observacoes: f.observacoes.trim() || null
      })
      guardarPedido({ codigo, tipo: 'encomenda', total: carrinho.total })
      carrinho.esvaziar()
      irPara(`/pedido/${codigo}`)
    } catch (e) {
      setProblema(e.message.charAt(0).toUpperCase() + e.message.slice(1))
      setEnviando(false)
    }
  }

  return (
    <div className="encomenda">
      <Topo atual="encomenda" />
      <header className="encomenda-heroi">
        <img src={arquivo('/fotos/banner-salgados.webp')} alt="" fetchPriority="high" />
        <div>
          <span className="rotulo">Encomenda · retirada na loja</span>
          <h1>Salgados para festa</h1>
          <p>Pacote de 25 de um sabor. Um cento são 4 pacotes.</p>
        </div>
      </header>

      <div className="vitrine-navegacao"><Abas categorias={categorias} /></div>

      <div className="encomenda-corpo">
        <main className="encomenda-catalogo">
          {categorias.map((cat) => {
            const lista = produtos.filter((p) => p.categoria === cat.id)
            return (
              <section key={cat.id} id={`cat-${cat.id}`} className="categoria" aria-labelledby={`festa-${cat.id}`}>
                <h2 id={`festa-${cat.id}`}>{cat.nome}</h2>
                <ul className="linhas-festa">
                  {lista.map((p) => (
                    <li key={p.id}>
                      <span className="linha-texto"><b>{p.nome}</b><small>25 un · {brl(p.preco)}</small></span>
                      <Stepper valor={pacotes(p.id)} aoMudar={(q) => mudar(p, q)} rotulo={p.nome} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </main>

        <aside className="encomenda-painel" aria-label="Sua encomenda">
          <section className="painel-secao" aria-labelledby="titulo-resumo">
            <h2 id="titulo-resumo">Sua encomenda</h2>
            {carrinho.itens.length ? (
              <ul className="resumo-encomenda">
                {carrinho.itens.map((it) => (
                  <li key={it.chave}>
                    <span><b>{it.qtd * 25}</b> {it.nome}</span>
                    <span className="preco">{brl(it.preco * it.qtd)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="dica">Toque no + dos salgados. Cada toque é um pacote de 25.</p>}
          </section>

          <section className="painel-secao" aria-labelledby="titulo-quando">
            <h2 id="titulo-quando">Quando você busca?</h2>
            {dias.length ? (
              <div className="dias" role="group" aria-label="Dia da retirada">
                {dias.map((d) => {
                  const { semana, data } = rotuloDia(d.dia)
                  return (
                    <button key={d.dia} type="button" disabled={d.fechado} aria-pressed={dia === d.dia} title={d.motivo}
                      onClick={() => { setDia(d.dia); setHorario(null) }}>
                      <small>{semana}</small>{d.fechado ? 'fechado' : data}
                    </button>
                  )
                })}
              </div>
            ) : <p className="dica">Nenhum horário liberado nas próximas semanas. Fale com a loja pelo WhatsApp.</p>}

            {diaEscolhido && (
              <div className="horarios" role="group" aria-label="Horário da retirada">
                {diaEscolhido.horarios.map((h) => (
                  <button key={h.iso} type="button" disabled={h.lotado} aria-pressed={horario?.iso === h.iso} onClick={() => setHorario(h)}>
                    {h.hora}{h.lotado && ' lotado'}
                  </button>
                ))}
              </div>
            )}
            <p className="dica">Pedido com {dados.loja.agenda.antecedencia}h de antecedência, no mínimo.</p>
          </section>

          <section className="painel-secao formulario" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados">Seus dados</h2>
            <label>Nome<input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} autoComplete="name" maxLength={60} /></label>
            <label>WhatsApp<input type="tel" value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} autoComplete="tel-national" placeholder="(75) 9 0000-0000" /></label>
            <label>Observação<textarea rows="2" maxLength={300} value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} placeholder="Ex.: separar em bandejas" /></label>
            <p className="dica">A loja confirma pelo WhatsApp. O pagamento é na retirada.</p>
            {problema && <p className="erro-campo" role="alert">{problema}</p>}
          </section>

          <footer className="encomenda-envio">
            <p className="checkout-total">
              <span>{unidades ? `${unidades} salgados` : 'Total'}</span>
              <b>{brl(carrinho.total)}</b>
            </p>
            <button type="button" className="botao botao-largo" disabled={enviando} onClick={enviar}>
              {enviando ? 'Enviando…' : 'Enviar encomenda'}
            </button>
          </footer>
        </aside>
      </div>

      <div className="barra-carrinho barra-encomenda">
        <span className="barra-carrinho-texto">
          <span>
            <small>{unidades ? `${unidades} salgados` : 'Nenhum pacote'}{horario && ` · ${rotuloDia(dia).semana} ${horario.hora}`}</small>
            <b>{brl(carrinho.total)}</b>
          </span>
        </span>
        <button type="button" className="botao-gema" disabled={enviando} onClick={enviar}>
          {enviando ? 'Enviando…' : 'Enviar encomenda'}
        </button>
      </div>
    </div>
  )
}
