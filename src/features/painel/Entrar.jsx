import { useState } from 'react'
import { arquivo } from '../../lib/config.js'
import { entrar, modoDemo } from '../../lib/db.js'

export default function Entrar({ aoEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      aoEntrar(await entrar(email, senha))
    } catch (e2) {
      setErro(e2.message)
      setEnviando(false)
    }
  }

  return (
    <main className="entrar">
      <form className="formulario" onSubmit={enviar}>
        <img src={arquivo('/logo.webp')} alt="Pastelanches Vitória" width="72" height="72" />
        <h1>Painel da loja</h1>
        {modoDemo
          ? <p className="dica">Modo demonstração: os pedidos ficam só neste navegador.</p>
          : <label>E-mail<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>}
        <label>Senha<input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
        {erro && <p className="erro-campo" role="alert">{erro}</p>}
        <button type="submit" className="botao botao-largo" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  )
}
