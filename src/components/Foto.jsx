import { useState } from 'react'
import { arquivo, recorteDe } from '../lib/config.js'

// Se a foto não carregar, fica a placa de massa com a inicial, nunca o ícone quebrado.
export default function Foto({ src, alt, className = '', prioridade = false }) {
  const [falhou, setFalhou] = useState(false)

  if (falhou || !src) {
    return (
      <div className={`foto foto-vazia ${className}`} aria-hidden="true">
        <span>{alt?.[0]}</span>
      </div>
    )
  }

  return (
    <img
      className={`foto ${className}`}
      src={arquivo(recorteDe(src))}
      alt={alt}
      loading={prioridade ? 'eager' : 'lazy'}
      fetchPriority={prioridade ? 'high' : undefined}
      decoding="async"
      onError={() => setFalhou(true)}
    />
  )
}
