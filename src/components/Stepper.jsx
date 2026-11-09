import Icone from './Icone.jsx'

export default function Stepper({ valor, aoMudar, rotulo, minimo = 0 }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button type="button" aria-label="Menos" onClick={() => aoMudar(valor - 1)} disabled={valor <= minimo}><Icone nome="menos" tamanho={18} /></button>
      <output aria-live="polite">{valor}</output>
      <button type="button" aria-label="Mais" onClick={() => aoMudar(valor + 1)} disabled={valor >= 99}><Icone nome="mais" tamanho={18} /></button>
    </div>
  )
}
