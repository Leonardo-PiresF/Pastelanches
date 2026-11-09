import { useState } from 'react'

const ler = (texto) => {
  const n = Number(String(texto).replace(/\s|R\$/g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}
const mostrar = (n) => (n ?? 0).toFixed(2).replace('.', ',')

// Salva ao sair do campo ou no Enter. Valor inválido volta ao anterior.
export default function CampoPreco({ valor, aoSalvar, rotulo }) {
  const [texto, setTexto] = useState(mostrar(valor))
  const [anterior, setAnterior] = useState(valor)
  const [estado, setEstado] = useState('')

  if (valor !== anterior) {
    setAnterior(valor)
    setTexto(mostrar(valor))
  }

  async function confirmar() {
    const novo = ler(texto)
    if (novo === null) return setTexto(mostrar(valor))
    if (novo === valor) return setTexto(mostrar(valor))
    setEstado('salvando')
    try {
      await aoSalvar(novo)
      setEstado('salvo')
      setTimeout(() => setEstado(''), 1500)
    } catch {
      setEstado('erro')
      setTexto(mostrar(valor))
    }
  }

  return (
    <label className={`campo-preco ${estado}`}>
      <span>{rotulo}</span>
      <span className="campo-preco-caixa">
        R$
        <input
          inputMode="decimal"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={confirmar}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label={`Preço ${rotulo}`}
        />
      </span>
      <small aria-live="polite">{estado === 'salvo' ? 'Salvo' : estado === 'erro' ? 'Não salvou' : ''}</small>
    </label>
  )
}
