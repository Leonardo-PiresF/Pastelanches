import { LOJA } from './config.js'

// Loja e cliente ficam no mesmo fuso (Bahia, UTC-3, sem horário de verão).
// Toda data "do dia" sai daqui para o painel e a vitrine concordarem com o banco.
const OFFSET = '-03:00'

const partes = (data) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: LOJA.fuso, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(data).map((p) => [p.type, p.value])
  )

export const diaDe = (data = new Date()) => {
  const p = partes(data)
  return `${p.year}-${p.month}-${p.day}`
}

export const horaDe = (data) => {
  const p = partes(new Date(data))
  return `${p.hour}:${p.minute}`
}

export const momento = (dia, hora) => new Date(`${dia}T${hora}:00${OFFSET}`)

export const diaDaSemana = (dia) => momento(dia, '12:00').getUTCDay()

export const somarDias = (dia, n) => diaDe(new Date(momento(dia, '12:00').getTime() + n * 86400000))

export const minutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export const paraHora = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

const SEMANA_CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const rotuloDia = (dia) => {
  const [, mes, d] = dia.split('-')
  return { semana: SEMANA_CURTA[diaDaSemana(dia)], data: `${d}/${mes}` }
}
