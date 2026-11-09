import { useState } from 'react'
import { useFeriados } from '../../hooks/useFeriados.js'
import { removerDataEspecial, salvarDataEspecial, salvarLoja } from '../../lib/db.js'
import { diaDe, diaDaSemana, rotuloDia, SEMANA, somarDias } from '../../lib/tempo.js'

const dataBr = (dia) => dia.split('-').reverse().join('/')

function Semana({ agenda }) {
  const [rascunho, setRascunho] = useState(agenda)
  const [estado, setEstado] = useState('')
  const mudarDia = (i, campo, valor) =>
    setRascunho({ ...rascunho, semana: rascunho.semana.map((d, j) => (j === i ? { ...d, [campo]: valor } : d)) })
  const mudar = (campo) => (e) => setRascunho({ ...rascunho, [campo]: Number(e.target.value) })
  const alterado = JSON.stringify(rascunho) !== JSON.stringify(agenda)

  async function salvar() {
    if (rascunho.semana.some((d) => d.on && d.fim <= d.ini)) return setEstado('O horário final precisa ser depois do inicial.')
    setEstado('Salvando…')
    try {
      await salvarLoja({ agenda: rascunho })
      setEstado('Agenda salva.')
    } catch (e) {
      setEstado(e.message)
    }
  }

  return (
    <section className="painel-bloco" aria-label="Horários de retirada">
      <h2>Retirada de encomendas</h2>
      <p className="dica">Dias e horários em que o cliente pode marcar a retirada.</p>
      <ul className="agenda-semana">
        {rascunho.semana.map((d, i) => (
          <li key={i}>
            <label className="chave">
              <input type="checkbox" checked={d.on} onChange={(e) => mudarDia(i, 'on', e.target.checked)} />
              <span>{SEMANA[i]}</span>
            </label>
            {d.on ? (
              <span className="faixa-horario">
                <input type="time" value={d.ini} onChange={(e) => mudarDia(i, 'ini', e.target.value)} aria-label={`${SEMANA[i]} abre`} />
                até
                <input type="time" value={d.fim} onChange={(e) => mudarDia(i, 'fim', e.target.value)} aria-label={`${SEMANA[i]} fecha`} />
              </span>
            ) : <span className="texto-apagado">Sem retirada</span>}
          </li>
        ))}
      </ul>
      <div className="duas-colunas tres">
        <label>
          Um horário a cada
          <select value={rascunho.intervalo} onChange={mudar('intervalo')}>
            {[30, 60, 90, 120].map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} h`.replace('.5', ',5')}</option>)}
          </select>
        </label>
        <label>
          Encomendas por horário
          <input type="number" min="1" max="20" value={rascunho.limite} onChange={mudar('limite')} />
        </label>
        <label>
          Antecedência mínima (horas)
          <input type="number" min="0" max="168" value={rascunho.antecedencia} onChange={mudar('antecedencia')} />
        </label>
      </div>
      <div className="linha-botoes">
        <button type="button" className="botao" disabled={!alterado} onClick={salvar}>Salvar horários</button>
        <span role="status" className="dica">{estado}</span>
      </div>
    </section>
  )
}

function DatasEspeciais({ agenda, especiais }) {
  const [nova, setNova] = useState({ data: '', tipo: 'fechado', ini: '13:00', fim: '18:00' })
  const [erro, setErro] = useState('')
  const feriados = useFeriados()
  const hoje = diaDe()
  const limite = somarDias(hoje, 365)
  const proximosFeriados = Object.entries(feriados).filter(([dia]) => dia >= hoje && dia <= limite).sort()

  const agir = (fn) => fn().then(() => setErro('')).catch((e) => setErro(e.message))

  function adicionar(e) {
    e.preventDefault()
    if (!nova.data) return setErro('Escolha a data.')
    if (nova.tipo === 'aberto' && nova.fim <= nova.ini) return setErro('O horário final precisa ser depois do inicial.')
    agir(() => salvarDataEspecial(nova.tipo === 'fechado' ? { data: nova.data, tipo: 'fechado', ini: null, fim: null } : nova))
  }

  const abrirFeriado = (dia) => {
    const padrao = agenda.semana[diaDaSemana(dia)]
    agir(() => salvarDataEspecial({ data: dia, tipo: 'aberto', ini: padrao.ini, fim: padrao.fim }))
  }

  return (
    <section className="painel-bloco" aria-label="Datas especiais">
      <h2>Datas especiais</h2>
      <p className="dica">Feche um dia de folga ou abra um dia diferente, com o horário que quiser. Vale por cima da semana.</p>
      <form className="nova-data" onSubmit={adicionar}>
        <label>Data<input type="date" min={hoje} value={nova.data} onChange={(e) => setNova({ ...nova, data: e.target.value })} /></label>
        <label>
          Neste dia
          <select value={nova.tipo} onChange={(e) => setNova({ ...nova, tipo: e.target.value })}>
            <option value="fechado">Sem retirada</option>
            <option value="aberto">Retirada em horário especial</option>
          </select>
        </label>
        {nova.tipo === 'aberto' && (
          <span className="faixa-horario">
            <input type="time" value={nova.ini} onChange={(e) => setNova({ ...nova, ini: e.target.value })} aria-label="Abre" />
            até
            <input type="time" value={nova.fim} onChange={(e) => setNova({ ...nova, fim: e.target.value })} aria-label="Fecha" />
          </span>
        )}
        <button type="submit" className="botao">Adicionar</button>
      </form>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}

      {especiais.length > 0 && (
        <ul className="lista-simples">
          {especiais.map((e) => (
            <li key={e.data}>
              <span><b>{dataBr(e.data)}</b> {rotuloDia(e.data).semana} · {e.tipo === 'fechado' ? 'sem retirada' : `${e.ini.slice(0, 5)} às ${e.fim.slice(0, 5)}`}</span>
              <button type="button" className="botao-texto" onClick={() => agir(() => removerDataEspecial(e.data))}>Remover</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Feriados nacionais</h3>
      <p className="dica">Entram fechados sozinhos. Se for abrir, toque em "Abrir neste dia". Feriado de Paulo Afonso entra como data especial.</p>
      {proximosFeriados.length ? (
        <ul className="lista-simples">
          {proximosFeriados.map(([dia, nome]) => {
            const especial = especiais.find((e) => e.data === dia)
            return (
              <li key={dia}>
                <span><b>{dataBr(dia)}</b> {nome} · {especial?.tipo === 'aberto' ? `aberto ${especial.ini.slice(0, 5)} às ${especial.fim.slice(0, 5)}` : 'fechado'}</span>
                {especial
                  ? <button type="button" className="botao-texto" onClick={() => agir(() => removerDataEspecial(dia))}>Voltar a fechar</button>
                  : <button type="button" className="botao botao-secundario" onClick={() => abrirFeriado(dia)}>Abrir neste dia</button>}
              </li>
            )
          })}
        </ul>
      ) : <p className="dica">A lista de feriados não carregou agora. As datas especiais continuam valendo.</p>}
    </section>
  )
}

export default function Agenda({ loja, especiais }) {
  return (
    <div className="agenda-painel">
      <Semana key={JSON.stringify(loja.agenda)} agenda={loja.agenda} />
      <DatasEspeciais agenda={loja.agenda} especiais={especiais} />
    </div>
  )
}
