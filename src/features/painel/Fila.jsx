import CartaoPedido from './CartaoPedido.jsx'
import { Vazio } from '../../components/Estado.jsx'
import { diaDe } from '../../lib/tempo.js'
import { brl } from '../../lib/formato.js'

const COLUNAS = [
  ['novo', 'Novos'],
  ['preparo', 'No fogo'],
  ['pronto', 'Prontos e na rua']
]

export default function Fila({ pedidos, aoAtualizar }) {
  const hoje = diaDe()
  const doDia = pedidos.filter((p) => p.tipo !== 'encomenda' && diaDe(new Date(p.criado_em)) === hoje)
  const encerrados = doDia.filter((p) => p.status === 'finalizado' || p.status === 'recusado')
  const faturado = doDia.filter((p) => p.status === 'finalizado').reduce((s, p) => s + p.totais.total, 0)

  return (
    <section aria-label="Pedidos de hoje">
      <div className="fila">
        {COLUNAS.map(([status, titulo]) => {
          const lista = doDia.filter((p) => p.status === status).sort((a, b) => a.senha - b.senha)
          return (
            <section key={status} className="fila-coluna" aria-label={titulo}>
              <h2>{titulo} <span>{lista.length}</span></h2>
              {lista.length
                ? lista.map((p) => <CartaoPedido key={p.id} pedido={p} aoAtualizar={aoAtualizar} />)
                : <Vazio texto={status === 'novo' ? 'Nenhum pedido esperando. Quando entrar, toca um aviso.' : 'Nada aqui agora.'} />}
            </section>
          )
        })}
      </div>

      <details className="encerrados">
        <summary>
          Encerrados hoje: {encerrados.length} · {brl(faturado)} entregues
        </summary>
        <div className="encerrados-lista">
          {encerrados.map((p) => <CartaoPedido key={p.id} pedido={p} aoAtualizar={aoAtualizar} />)}
        </div>
      </details>
    </section>
  )
}
