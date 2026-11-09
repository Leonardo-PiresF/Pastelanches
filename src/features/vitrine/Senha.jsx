import { useEffect, useState } from 'react'
import { Carregando, Erro } from '../../components/Estado.jsx'
import { ETAPAS, LOJA } from '../../lib/config.js'
import { brl, nomeItem, quando, tituloPedido } from '../../lib/formato.js'
import { statusPedido } from '../../lib/db.js'
import '../../styles/vitrine.css'

const ENCERRADO = ['finalizado', 'recusado']

function instrucao(p) {
  if (p.status === 'recusado') return `A loja não conseguiu atender: ${p.motivo_recusa}. Nada foi cobrado.`
  if (p.tipo === 'encomenda') return p.status === 'novo'
    ? 'A loja vai confirmar sua encomenda pelo WhatsApp. O pagamento é na retirada.'
    : `Retirada ${quando(p.retirada_em)}, em ${LOJA.endereco}. Pague na retirada.`
  if (p.tipo === 'delivery') return p.status === 'pronto'
    ? 'O motoboy está a caminho. Pague na entrega.'
    : 'Avisamos aqui quando sair para entrega. Pague na entrega.'
  return p.status === 'pronto'
    ? 'Pode buscar no balcão. Pague no caixa mostrando esta senha.'
    : 'Pague no caixa mostrando esta senha. Chamamos quando estiver pronto.'
}

export default function Senha({ codigo }) {
  const [pedido, setPedido] = useState(undefined)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let vivo = true
    let timer
    async function consultar() {
      try {
        const p = await statusPedido(codigo)
        if (!vivo) return
        setPedido(p)
        setErro('')
        if (p && !ENCERRADO.includes(p.status)) timer = setTimeout(consultar, 6000)
      } catch (e) {
        if (!vivo) return
        setErro(e.message)
        timer = setTimeout(consultar, 10000)
      }
    }
    consultar()
    return () => {
      vivo = false
      clearTimeout(timer)
    }
  }, [codigo])

  if (pedido === undefined && erro) return <Erro texto={erro} />
  if (pedido === undefined) return <Carregando texto="Buscando seu pedido…" />
  if (!pedido) return <Erro texto={`Não encontramos o pedido ${codigo}.`} />

  const p = pedido
  const etapas = ETAPAS[p.tipo]
  const posicao = etapas.findIndex(([s]) => s === p.status)
  const avaliar = LOJA.linkAvaliacao && (p.status === 'pronto' || p.status === 'finalizado')

  return (
    <main className="senha-tela">
      <a href="#/" className="voltar">Voltar ao cardápio</a>

      <section className={`senha-card ${p.status === 'recusado' ? 'recusado' : ''}`} aria-live="polite">
        <span className="rotulo">{tituloPedido(p)} · Sua senha</span>
        <b className="senha-numero">{p.senha}</b>
        <p>{instrucao(p)}</p>
        {p.status !== 'recusado' && (
          <ol className="andamento" aria-label="Andamento">
            {etapas.map(([s, nome], i) => (
              <li key={s} className={i <= posicao ? 'feito' : ''} aria-current={i === posicao ? 'step' : undefined}>{nome}</li>
            ))}
          </ol>
        )}
      </section>

      {erro && <p className="aviso-conexao" role="status">Sem conexão. Tentando atualizar…</p>}

      <section className="senha-itens" aria-label="Itens do pedido">
        <ul>
          {p.itens.map((it, i) => (
            <li key={i}>
              <span><b>{it.qtd}x</b> {nomeItem(it)}</span>
              <span className="preco">{brl(it.preco * it.qtd)}</span>
            </li>
          ))}
        </ul>
        {p.totais.taxa > 0 && <p className="linha-total"><span>Entrega</span><span>{brl(p.totais.taxa)}</span></p>}
        <p className="linha-total total"><span>Total</span><b>{brl(p.totais.total)}</b></p>
      </section>

      {avaliar && (
        <a className="botao botao-largo avaliar" href={LOJA.linkAvaliacao} target="_blank" rel="noopener noreferrer">
          Gostou? Avalie a gente no Google
        </a>
      )}
      <p className="dica centro">Código do pedido {codigo}. Dúvidas: WhatsApp {LOJA.whatsappExibicao}</p>
    </main>
  )
}
