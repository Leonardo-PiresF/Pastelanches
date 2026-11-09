import CartaoPedido from './CartaoPedido.jsx'
import { Vazio } from '../../components/Estado.jsx'
import { diaDaSemana, diaDe, rotuloDia, SEMANA } from '../../lib/tempo.js'

function producao(lista) {
  const total = {}
  lista.filter((p) => p.status !== 'recusado').forEach((p) =>
    p.itens.forEach((it) => { total[it.nome] = (total[it.nome] ?? 0) + it.qtd }))
  return Object.entries(total).sort((a, b) => b[1] - a[1])
}

export default function Encomendas({ pedidos, aoAtualizar }) {
  const hoje = diaDe()
  const futuras = pedidos
    .filter((p) => p.tipo === 'encomenda' && diaDe(new Date(p.retirada_em)) >= hoje && p.status !== 'finalizado')
    .sort((a, b) => a.retirada_em.localeCompare(b.retirada_em))

  const porDia = futuras.reduce((dias, p) => {
    const dia = diaDe(new Date(p.retirada_em))
    ;(dias[dia] ??= []).push(p)
    return dias
  }, {})

  if (!futuras.length) return <Vazio texto="Nenhuma encomenda marcada. As novas aparecem aqui por dia de retirada." />

  return (
    <div className="encomendas">
      {Object.entries(porDia).map(([dia, lista]) => {
        const { data } = rotuloDia(dia)
        const resumo = producao(lista)
        return (
          <section key={dia} className="encomendas-dia" aria-label={`Encomendas de ${data}`}>
            <h2>{dia === hoje ? 'Hoje' : SEMANA[diaDaSemana(dia)]} <span>{data}</span></h2>
            <div className="producao">
              <h3>Produção do dia</h3>
              <ul>
                {resumo.map(([nome, pacotes]) => (
                  <li key={nome}><b>{pacotes * 25}</b> {nome} <small>({pacotes} pct)</small></li>
                ))}
              </ul>
            </div>
            <div className="encomendas-lista">
              {lista.map((p) => <CartaoPedido key={p.id} pedido={p} aoAtualizar={aoAtualizar} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
