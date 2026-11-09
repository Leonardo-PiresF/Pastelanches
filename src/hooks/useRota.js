import { useEffect, useState } from 'react'

const ler = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export function useRota() {
  const [partes, setPartes] = useState(ler)
  useEffect(() => {
    const mudar = () => {
      setPartes(ler())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', mudar)
    return () => window.removeEventListener('hashchange', mudar)
  }, [])
  return partes
}

export const irPara = (caminho) => { window.location.hash = caminho }
