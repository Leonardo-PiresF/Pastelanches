import { useEffect, useRef } from 'react'
import Icone from './Icone.jsx'

// Folha que sobe do rodapé no celular e vira janela no computador.
// <dialog> nativo: foco preso, Esc fecha e o fundo fica inerte sem biblioteca.
export default function Folha({ aberta, aoFechar, titulo, children, rodape, comTopo = true, classe = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (aberta && !dialog.open) dialog.showModal()
    if (!aberta && dialog.open) dialog.close()
  }, [aberta])

  return (
    <dialog
      ref={ref}
      className={`folha ${classe}`}
      aria-label={titulo}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
    >
      {aberta && (
        <div className="folha-corpo">
          <span className="folha-alca" aria-hidden="true" />
          {comTopo && (
            <header className="folha-topo">
              <h2>{titulo}</h2>
              <button type="button" className="botao-fechar" onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
            </header>
          )}
          <div className="folha-conteudo">{children}</div>
          {rodape && <footer className="folha-rodape">{rodape}</footer>}
        </div>
      )}
    </dialog>
  )
}
