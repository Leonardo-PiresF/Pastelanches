// Carregando, erro e vazio com a mesma cara em todas as telas.
export function Carregando({ texto = 'Carregando…' }) {
  return <p className="estado" role="status">{texto}</p>
}

export function Erro({ texto, aoTentar }) {
  return (
    <div className="estado estado-erro" role="alert">
      <p>{texto}</p>
      {aoTentar && <button type="button" className="botao botao-secundario" onClick={aoTentar}>Tentar de novo</button>}
    </div>
  )
}

export function Vazio({ texto }) {
  return <p className="estado estado-vazio">{texto}</p>
}
