import { diaDe, diaDaSemana, minutos, momento, paraHora, somarDias } from './tempo.js'

// Janela de retirada de um dia: data especial da dona vence feriado, feriado vence a semana.
export function janelaDoDia(dia, { agenda, especiais, feriados }) {
  const especial = especiais.find((e) => e.data === dia)
  if (especial?.tipo === 'fechado') return { fechado: true, motivo: 'Fechado' }
  if (especial?.tipo === 'aberto') return { ini: especial.ini.slice(0, 5), fim: especial.fim.slice(0, 5) }
  if (feriados[dia]) return { fechado: true, motivo: feriados[dia] }
  const semana = agenda.semana[diaDaSemana(dia)]
  return semana.on ? { ini: semana.ini, fim: semana.fim } : { fechado: true, motivo: 'Fechado' }
}

export function montarDias({ agenda, especiais, feriados, ocupados, agora = new Date(), quantos = 21 }) {
  const lotacao = new Map(ocupados.map((o) => [new Date(o.retirada_em).getTime(), o.qtd]))
  const minimo = agora.getTime() + agenda.antecedencia * 3600000
  const hoje = diaDe(agora)

  return Array.from({ length: quantos }, (_, i) => {
    const dia = somarDias(hoje, i)
    const janela = janelaDoDia(dia, { agenda, especiais, feriados })
    if (janela.fechado) return { dia, fechado: true, motivo: janela.motivo, horarios: [] }

    const horarios = []
    for (let m = minutos(janela.ini); m < minutos(janela.fim); m += agenda.intervalo) {
      const quando = momento(dia, paraHora(m))
      if (quando.getTime() < minimo) continue
      horarios.push({
        hora: paraHora(m),
        iso: quando.toISOString(),
        lotado: (lotacao.get(quando.getTime()) ?? 0) >= agenda.limite
      })
    }
    return { dia, fechado: false, horarios }
  }).filter((d) => d.fechado || d.horarios.length)
}
